import { NodeOAuthClient, type NodeSavedSession, type NodeSavedState } from "@atproto/oauth-client-node";
import { JoseKey } from "@atproto/jwk-jose";

export const client = new NodeOAuthClient({
	// This object will be used to build the payload of the /client-metadata.json
	// endpoint metadata, exposing the client metadata to the OAuth server.
	clientMetadata: {
		// Must be a URL that will be exposing this metadata
		client_id: "https://githubsky.vercel.app/api/client-metadata",
		client_name: "githubsky",
		client_uri: "https://githubsky.vercel.app/",
		//		logo_uri: "https://githubsky.vercel.app/next.svg",
		//		tos_uri: "https://githubsky.vercel.app/tos",
		//		policy_uri: "https://githubsky.vercel.app/policy",
		redirect_uris: ["https://githubsky.vercel.app/api/callback"],
		scope: "atproto transition:generic",
		grant_types: ["authorization_code", "refresh_token"],
		response_types: ["code"],
		application_type: "web",
		token_endpoint_auth_method: "private_key_jwt",
		dpop_bound_access_tokens: true,
		jwks_uri: "https://githubsky.vercel.app/api/jwks.json",
		token_endpoint_auth_signing_alg: "ES256",
	},
	// Used to authenticate the client to the token endpoint. Will be used to
	// build the jwks object to be exposed on the "jwks_uri" endpoint.
	keyset: await Promise.all([
		JoseKey.fromImportable(process.env.PRIVATE_KEY_TEST ?? ""),
	]),

	// Interface to store authenticated session data
	sessionStore: {
		set: (sub: string, sessionData: NodeSavedSession) => setredis(`session_${sub}`, sessionData),
		get: (key: string) => getredis(`session_${key}`),
		del: (key: string) => delredis(`session_${key}`),
	},

	// Interface to store authorization state data (during authorization flows)
	stateStore: {
		set: (sub: string, sessionData: NodeSavedState) => setredis(`state_${sub}`, sessionData, 3600),
		get: (key: string) => getredis(`state_${key}`),
		del: (key: string) => delredis(`state_${key}`),
	},

	// A lock to prevent concurrent access to the session store. Optional if only one instance is running.
	//requestLock,
});
/**@param ex 期限切れになるまでの秒数 */
async function setredis(key: string, value: object | string, ex?: number) {
	const res = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/${key}${typeof ex === "number" ? `?ex=${ex}` : ""}`, {
		method: "POST",
		body: typeof value === "object" ? JSON.stringify(value) : value,
		headers: {
			Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
		},
	});
}
async function getredis(key: string, parse = true) {
	const res = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/${key}`, {
		headers: {
			Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
		},
	});
	if (!res.ok) {
		return;
	}
	const data = await res.json();
	return parse ? JSON.parse(data.result) : data.result;
}
async function delredis(key: string) {
	await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/del/${key}`, {
		headers: {
			Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
		},
	});
}

export const redis = { setredis, getredis, delredis };