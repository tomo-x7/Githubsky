import { DidResolver, HandleResolver } from "atproto-browser-resolvers";
import { clientMetadata } from "@githubsky/common";
import type { secrets } from "..";
import { ClientError, ServerError } from "../util";
export class OAuthClient {
	private privateKey: CryptoKey;
	private privateJwk: JsonWebKey;
	private handleResolver = new HandleResolver("https://public.api.bsky.app");
	private didResolver = new DidResolver();
	private constructor(privateKey: CryptoKey, jwk: JsonWebKey) {
		this.privateKey = privateKey;
		this.privateJwk = jwk;
	}
	static async init(env: secrets) {
		const privateKey = await crypto.subtle.importKey(
			"jwk",
			JSON.parse(env.PRIVATE_KEY ?? ""),
			{ name: "ECDSA", namedCurve: "P-256" },
			true,
			["sign"],
		);
		const privateJwk = await crypto.subtle.exportKey("jwk", privateKey);
		if (privateJwk instanceof ArrayBuffer) throw new ServerError("cannot parse jwk");
		return new OAuthClient(privateKey, privateJwk);
	}
	get clientMetadata() {
		return clientMetadata;
	}
	get jwks() {
		const publicKey: JsonWebKeyWithKid = {
			kty: "EC",
			kid: "privateKey1",
			use: "sig", //署名・検証を指す。対義語はenc（暗号・複合）
			crv: "P-256",
			x: this.privateJwk.x,
			y: this.privateJwk.y,
		};
		return { keys: [publicKey] };
	}
	async login(handleOrDid: string, state: string) {
		//ハンドルからPDSの情報を取得
		const did = handleOrDid.startsWith("did:") ? handleOrDid : await this.handleResolver.resolve(handleOrDid);
		if (did == null) throw new ClientError("cannot resolve handle");
		const didDoc = await this.didResolver.resolve(did).catch((e) => console.error(e));
		if (didDoc == null) throw new ClientError("cannot resolve did");
		const resourceServer = didDoc.service?.filter(
			({ id, type }) => id === "#atproto_pds" && type === "AtprotoPersonalDataServer",
		)?.[0]?.serviceEndpoint;
		if (resourceServer == null || typeof resourceServer !== "string") throw new ClientError("cannot parse didDoc");

		//リソースサーバー(PDS)から認可サーバーの情報を取得
		const resourceServerMeta = await fetch(`${resourceServer}/.well-known/oauth-protected-resource`)
			.then((r) => r.json() as Promise<resourceServer>)
			.catch((e) => {
				throw new ServerError(String(e));
			});
		const authServer=resourceServerMeta.authorization_servers[0]
		if (authServer==null) throw new ServerError("cannot get auth server");

		//認可サーバーの情報を取得
		const authServerMeta = await fetch(`${authServer}/.well-known/oauth-authorization-server`)
		.then((r) => r.json() as Promise<authServer>)
		.catch((e) => {
			throw new ServerError(String(e));
		});
		return { endPoint: authServerMeta.pushed_authorization_request_endpoint };
	}
}
