import { JoseKey } from "@atproto/jwk-jose";
import { NodeOAuthClient, type NodeSavedSession, type NodeSavedState } from "@atproto/oauth-client-node";
import { clientMetadata } from "@githubsky/common";
import { Redis } from "@upstash/redis";

const redisClient = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });

export const createClient = async () =>
	new NodeOAuthClient({
		// This object will be used to build the payload of the /client-metadata.json
		// endpoint metadata, exposing the client metadata to the OAuth server.
		clientMetadata,
		// Used to authenticate the client to the token endpoint. Will be used to
		// build the jwks object to be exposed on the "jwks_uri" endpoint.
		keyset: await Promise.all([JoseKey.fromImportable(process.env.PRIVATE_KEY ?? "")]),

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
		// requestLock: async (key, fn) => {
		// 	const lock = new Lock({ redis: redisClient, id: key });
		// 	const locked = await lock.acquire({ lease: 30000 });
		// 	try {
		// 		return await fn();
		// 	} finally {
		// 		await lock.release();
		// 	}
		// },
	});
/**@param ex 期限切れになるまでの秒数 */
async function setredis(key: string, value: object | string, ex?: number) {
	await redisClient.set(key, value, typeof ex === "number" ? { ex } : undefined);
}
async function getredis<T>(key: string) {
	console.log(`get ${key}`);
	const res = await redisClient.get(key);
	return res as T;
}
async function delredis(key: string) {
	await redisClient.del(key);
}

export const redis = { setredis, getredis, delredis };
