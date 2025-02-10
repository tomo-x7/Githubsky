import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { hc } from "hono/client";
import { z } from "zod";
import { OAuthClient } from "./bsky-oauth";
import { CustomError } from "./util";

const app = new Hono().basePath("api/");
const client = await OAuthClient.init();

const schema = app
	.get("/", (c) => c.text("hello worker"))
	.get("/client-metadata.json", async (c) => {
		return c.json(client.clientMetadata);
	})
	.get("/jwks.json", async (c) => {
		return c.json(client.jwks);
	})
	.get("/login", zValidator("query", z.object({ handle: z.string() })), async (c) => {
		const { handle } = c.req.valid("query");
		const state = crypto.getRandomValues(new Uint16Array(1))[0].toString();
		// const url = await client.authorize(handle, { signal: ac.signal, state });
		// return c.redirect(url);
		const r = await client.login(handle);
		return c.json(r);
	});
// .get("/callback", async (c) => {
// 	const { session, state } = await client.callback(new URLSearchParams(c.req.query()));
// 	const agent = new Agent(session);
// 	const profile = (await agent.getProfile({ actor: agent.assertDid })).data;
// 	const sessionID = Buffer.from(crypto.getRandomValues(new Uint32Array(10)).buffer).toString("base64url");
// 	redis.setredis(`mysession_${sessionID}`, session.did, 3600);
// 	setCookie(c, "session", sessionID, {
// 		httpOnly: true,
// 		secure: true,
// 		sameSite: "Lax",
// 		maxAge: 60 * 60 /* 1?? */,
// 	});
// 	return c.html(
// 		`<script>localStorage.setItem("handle","${profile.handle}");localStorage.setItem("icon","${profile.avatar}");window.location="/";</script>`,
// 	);
// })
// .get("/test", async (c) => {
// 	const sessionId = getCookie(c, "session");
// 	if (sessionId == null) return c.status(401);
// 	const did = await redis.getredis(`mysession_${sessionId}`, false);
// 	if (did == null || typeof did !== "string") return c.status(401);
// 	try {
// 		const agent = new Agent(await client.restore(did));
// 		return c.json(agent.getPreferences());
// 	} catch (e) {
// 		return c.status(401);
// 	}
// });

app.onError((err) => {
	if (err instanceof CustomError) {
		if (err.isClientError) {
			return new Response(err.message, { status: 400 });
		} else {
			console.error(err.message);
			return new Response(null, { status: 500 });
		}
	}
	console.error(err);
	return new Response(null, { status: 500 });
});

export default app;

export function createClient() {
	return hc<typeof schema>("/api");
}
