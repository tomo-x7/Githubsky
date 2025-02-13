import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { hc } from "hono/client";
import { z } from "zod";
import { OAuthClient } from "./bsky-oauth";
import { ClientError, CustomError, ServerError } from "./util";

export type secrets = {
	[key in
		| "PRIVATE_KEY"
		| "UPSTASH_REDIS_REST_URL"
		| "UPSTASH_REDIS_REST_TOKEN"
		| "SUPABASE_URL"
		| "SUPABASE_KEY"
		| "GITHUB_CLIENT_SECRET"]: string;
};
type Env = { Variables: { client: OAuthClient }; Bindings: secrets };
const app = new Hono<Env>().basePath("api/");
app.use(async (c, next) => {
	c.set("client", await OAuthClient.init(c.env));
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
	.get("/login", zValidator("query", z.object({ handle: z.string() })), async (c) => {
		const { handle } = c.req.valid("query");
		const url = await c.get("client").login(handle);
		return c.redirect(url);
	})
.get("/callback", async (c) => {
	c.req.query()
	const did = await c.get("client").callback((c.req.query()));
	const sessionID = Buffer.from(crypto.getRandomValues(new Uint32Array(10)).buffer).toString("base64url");
	await c.get("client").redis.set(`mysession_${sessionID}`, did, {ex:3600});
	setCookie(c, "session", sessionID, {
		httpOnly: true,
		secure: true,
		sameSite: "Lax",
		maxAge: 60 * 60 /* 1?? */,
	});
	return c.text(
		`login success. you are ${did}`,
	);
})
.get("/test", async (c) => {
	const sessionId = getCookie(c, "session");
	if (sessionId == null) return c.status(401);
	const did = await c.get("client").redis.get(`mysession_${sessionId}`);
	if (did == null || typeof did !== "string") return c.status(401);
	try {
		return c.text("you are "+did);
	} catch (e) {
		return c.status(401);
	}
});

app.onError((err) => {
	if (err instanceof ClientError) {
		return new Response(err.message, { status: 400 });
	} else if (err instanceof ServerError) {
		console.error(err.message);
		return new Response(null, { status: 500 });
	}
	console.error(err);
	return new Response(null, { status: 500 });
});

export default app;

export function createClient() {
	return hc<typeof schema>("/api");
}
