import { Supabase } from "@githubsky/common";
import type { Redis } from "@upstash/redis/cloudflare";
import type { secrets } from ".";
import { ClientError, genRandom } from "./util";

const CLIENT_ID = "Ov23liNFnDxcVwZVTD8r";
const REDIRECT_URI = "https://githubsky.tomo-x.win/api/github_callback";
export async function github_login(redis: Redis, did: string) {
	const state = genRandom(16);
	await redis.set(`gh_state_${state}`, did, { ex: 1200 });
	const sp = new URLSearchParams();
	sp.set("client_id", CLIENT_ID);
	sp.set("redirect_uri", REDIRECT_URI);
	// sp.set("scope","")
	sp.set("state", state);
	const url = new URL("https://github.com/login/oauth/authorize");
	url.search = sp.toString();
	return url;
}
export async function github_callback({ state, code }: Record<string, string | null>, env: secrets, redis: Redis) {
	if (state == null || code == null) throw new ClientError("query paramater missing");
	const DID = await redis.get(`gh_state_${state}`);
	if (DID == null || typeof DID !== "string") throw new ClientError("invalid state");
	const body = { client_id: CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code, redirect_uri: REDIRECT_URI };
	const headers = { "Content-Type": "application/json", Accept: "application/json" };
	const res: tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
		method: "POST",
		headers,
		body: JSON.stringify(body),
	}).then((r) => r.json());
	const { login: github_name }: userResponse = await fetch("https://api.github.com/user", {
		headers: { "User-Agent": "githubsky", Authorization: `Bearer ${res.access_token}` },
	}).then((r) => r.json());
	const supabase = new Supabase(env);
	await supabase.client.from("userdata_v2").upsert({ DID, github_name, Github_token: res.access_token });
	return `logged in as ${github_name}`;
}

type tokenResponse = {
	access_token: string;
	scope: string;
	token_type: string;
};
type userResponse = {
	login: string;
};
