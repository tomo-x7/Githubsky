import { Redis } from "@upstash/redis/cloudflare";
import { secrets } from ".";
import { ClientError, genRandom } from "./util";

const CLIENT_ID = "Ov23liNFnDxcVwZVTD8r";
const REDIRECT_URI = "https://githubsky.pages.dev/api/github_callback";
export async function github_login(redis: Redis) {
	const state = genRandom(16);
	await redis.set(`gh_state_${state}`, "", { ex: 1200 });
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
	const savedState = await redis.get(`gh_state_${state}`);
	if (savedState == null) throw new ClientError("invalid state");
	const body = { client_id: CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code, redirect_uri: REDIRECT_URI };
	const headers = { "Content-Type": "application/json", Accept: "application/json" };
	const res:tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
		method: "POST",
		headers,
		body: JSON.stringify(body),
	}).then((r) => r.json());
	return res;
}

type tokenResponse = {
	access_token: string;
	scope: string;
	token_type: string;
};
