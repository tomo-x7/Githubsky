import { Supabase } from "@githubsky/common";
import { zValidator } from "@hono/zod-validator";
import { Redis } from "@upstash/redis/cloudflare";
import { type Context, Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { z } from "zod";
import { OAuthClient } from "./bsky-oauth";
import { github_callback, github_login, type userResponse } from "./github_oauth";
import { ClientError, ServerError, type exitReturn, type statusReturn } from "./util";

export type secrets = {
	[key in
		| "PRIVATE_KEY"
		| "UPSTASH_REDIS_REST_URL"
		| "UPSTASH_REDIS_REST_TOKEN"
		| "SUPABASE_URL"
		| "SUPABASE_KEY"
		| "GITHUB_CLIENT_SECRET"]: string;
};
type Env = { Variables: { client: OAuthClient; redis: Redis }; Bindings: secrets };
const app = new Hono<Env>().basePath("api/");
app.use(async (c, next) => {
	const redis = new Redis({ url: c.env.UPSTASH_REDIS_REST_URL, token: c.env.UPSTASH_REDIS_REST_TOKEN });
	c.set("client", await OAuthClient.init(c.env, redis));
	c.set("redis", redis);
	return await next();
});

const schema = app
	.get("/", (c) => c.text("hello worker"))
	.get("/client-metadata.json", async (c) => {
		return c.json(c.get("client").clientMetadata);
	})
	.get("/jwks.json", async (c) => {
		return c.json(c.get("client").jwks);
	})
	.post("/login", zValidator("json", z.object({ handle: z.string() })), async (c) => {
		const { handle } = c.req.valid("json");
		const url = await c.get("client").login(handle);
		return c.text(url.toString());
	})
	.get("/callback", async (c) => {
		const did = await c.get("client").callback(c.req.query());
		const sessionID = Buffer.from(crypto.getRandomValues(new Uint32Array(10)).buffer).toString("base64url");
		await c.get("redis").set(`mysession_${sessionID}`, did, { ex: 3600 });
		setCookie(c, "session", sessionID, {
			httpOnly: true,
			secure: true,
			sameSite: "Lax",
			maxAge: 60 * 60 /* 1?? */,
		});
		return c.redirect("/");
	})
	.post("/github_login", async (c) => {
		const did = await bskyAuth(c);
		if (did == null) return c.text("bsky auth before", 401);
		const url = await github_login(c.get("redis"), did);
		return c.text(url.toString());
	})
	.get("/github_callback", async (c) => {
		const res = await github_callback(c.req.query(), c.env, c.get("redis"));
		//TODO
		return c.redirect("/?callback=githuboauth");
	})
	.post("/github_name", zValidator("json", z.object({ name: z.string() })), async (c) => {
		const { name } = c.req.valid("json");
		const did = await bskyAuth(c);
		if (did == null) return c.text("bsky auth before", 401);
		const supabase = new Supabase(c.env);
		const { data, error } = await supabase.client.from("userdata_v2").select().eq("DID", did);
		if (error != null) {
			console.error(error);
			throw new ServerError("nolog");
		}
		if (data[0] == null) {
			await supabase.client.from("userdata_v2").insert([{ DID: did, github_name: name }]);
			return c.json({ create: true });
		} else {
			return c.json({ create: false });
		}
	})
	.get("/status", async (c) => {
		const did = await bskyAuth(c);
		if (did == null) return c.json<statusReturn>({ bsky: false, github: "none" });
		const profile = await getBskyProfile(did);
		if (profile == null) return c.json<statusReturn>({ bsky: false, github: "none" });
		const bskyName = profile.displayName ?? profile.handle;
		const bskyAvatar = profile.avatar;
		const bsky = { bsky: true, bskyName, bskyAvatar } as const;
		const supabase = new Supabase(c.env);
		const { data, error } = await supabase.client.from("userdata_v2").select().eq("DID", did);
		if (error != null) {
			console.error(error);
			throw new ServerError("nolog");
		}
		if (data[0] == null) return c.json<statusReturn>({ ...bsky, github: "none" });
		if (data[0].Github_token == null)
			return c.json<statusReturn>({ ...bsky, github: "name", github_name: data[0].github_name });
		const { login: github_name, avatar_url }: userResponse = await fetch("https://api.github.com/user", {
			headers: { "User-Agent": "githubsky", Authorization: `Bearer ${data[0].Github_token}` },
		}).then((r) => r.json());
		return c.json<statusReturn>({ ...bsky, github: "oauth", github_name, avatar_url });
	})
	.delete("/exit", async (c) => {
		const did = await bskyAuth(c);
		if (did == null) return c.json<exitReturn>({ success: false, error: "bsky auth before" }, 401);
		const supabase = new Supabase(c.env);
		const res = await supabase.client.from("userdata_v2").delete().eq("DID", did);
		if (res.error != null) return c.json<exitReturn>({ success: false, error: res.error.message }, 500);
		await delSession(c);
		return c.json<exitReturn>({ success: true });
	});

app.onError((err) => {
	if (err instanceof ClientError) {
		return new Response(err.message, { status: 400 });
	} else if (err instanceof ServerError) {
		if (err.message !== "nolog") console.error(err.message);
		return new Response(null, { status: 500 });
	}
	console.error(err);
	return new Response(null, { status: 500 });
});

export default app;

export type schema = typeof schema;

async function bskyAuth(c: Context<Env>): Promise<string | null> {
	const sessionId = getCookie(c, "session");
	if (sessionId == null) return null;
	const did = await c.get("redis").get(`mysession_${sessionId}`);
	if (did == null || typeof did !== "string") return null;
	return did;
}

async function delSession(c: Context<Env>) {
	const sessionId = getCookie(c, "session");
	if (sessionId == null) return;
	await c.get("redis").del(`mysession_${sessionId}`);
	deleteCookie(c, "session");
}

type profile = {
	did: string;
	handle: string;
	displayName: string | undefined;
	avatar: string | undefined;
};
async function getBskyProfile(did: string) {
	return await fetch(`https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${did}`)
		.then((r) => {
			if (!r.ok) throw new Error();
			return r.json<profile>();
		})
		.catch((err) => {
			console.error(err);
			return null;
		});
}
