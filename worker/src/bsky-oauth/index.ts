import { AppViewHandleResolver } from "@atproto-labs/handle-resolver";
import { DidResolver } from "@atproto/identity";
import { clientMetadata } from "@githubsky/common";
import type { secrets } from "..";
import { ClientError, ServerError } from "../util";
export class OAuthClient {
	private privateKey: CryptoKey;
	private privateJwk: JsonWebKey;
	private handleResolver = new AppViewHandleResolver("https://public.api.bsky.app");
	private didResolver = new DidResolver({});
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
	async login(handle: string) {
		const did = await this.handleResolver.resolve(handle);
		if (did == null) throw new ClientError("cannot resolve handle");
		const didDoc = await this.didResolver.resolve(did);
		if (didDoc == null) throw new ClientError("cannot resolve did");
		const endPoint = didDoc.service?.filter(
			({ id, type }) => id === "#atproto_pds" && type === "AtprotoPersonalDataServer",
		)[0].serviceEndpoint;
		if (endPoint == null || typeof endPoint !== "string") throw new ClientError("cannot resolve didDoc");
		return { endPoint };
	}
}
