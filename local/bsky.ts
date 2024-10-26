import { NodeOAuthClient } from "@atproto/oauth-client-node";
import { JoseKey } from "@atproto/jwk-jose";
import { redisStore } from "./redisStore";
import { Agent } from "@atproto/api";
const client = await NodeOAuthClient.fromClientId({
	clientId: "https://schedulesky.vercel.app/api/client-metadata.json",
	keyset: await Promise.all([
		JoseKey.fromImportable(process.env.PRIVATE_KEY_1 ?? ""),
		JoseKey.fromImportable(process.env.PRIVATE_KEY_2 ?? ""),
		JoseKey.fromImportable(process.env.PRIVATE_KEY_3 ?? ""),
	]),
	sessionStore: new redisStore("session"),
	stateStore: new redisStore("state", 3600),
});

export async function createPost({ did }: { did: string }) {
	const session = await client.restore(did);
	const agent = new Agent(session);
	agent.post;
}
