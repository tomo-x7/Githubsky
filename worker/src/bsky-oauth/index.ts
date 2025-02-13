import { DidResolver, HandleResolver } from "@tomo-x/resolvers";
import { clientMetadata } from "@githubsky/common";
import type { secrets } from "..";
import { ClientError, ServerError } from "../util";
import { Redis } from "@upstash/redis/cloudflare";

const b64Enc = (s: string) => btoa(s).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
const genRandom = (bytes: number) => b64Enc(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(bytes))));
export class OAuthClient {
	private privateKey: CryptoKey;
	private privateJwk: JsonWebKeyWithKid;
	private handleResolver = new HandleResolver("https://public.api.bsky.app");
	private didResolver = new DidResolver();
	private redis: Redis;
	private constructor(privateKey: CryptoKey, jwk: JsonWebKeyWithKid, redis: Redis) {
		this.privateKey = privateKey;
		this.privateJwk = jwk;
		this.redis = redis;
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
		const redis = new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN });
		return new OAuthClient(privateKey, { ...privateJwk, kid: "privateKey1" }, redis);
	}
	get clientMetadata() {
		return clientMetadata;
	}
	get jwks() {
		const publicKey: JsonWebKeyWithKid = {
			kty: "EC",
			kid: this.privateJwk.kid,
			use: "sig", //署名・検証を指す。対義語はenc（暗号・複合）
			crv: "P-256",
			x: this.privateJwk.x,
			y: this.privateJwk.y,
		};
		return { keys: [publicKey] };
	}
	async login(handleOrDid: string) {
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
		const authServer = resourceServerMeta.authorization_servers[0];
		if (authServer == null) throw new ServerError("cannot get auth server");

		//認可サーバーの情報を取得
		const authServerMeta = await fetch(`${authServer}/.well-known/oauth-authorization-server`)
			.then((r) => r.json() as Promise<authServer>)
			.catch((e) => {
				throw new ServerError(String(e));
			});

		//認可サーバーに情報を送ってURLを取得(PAR)
		const PARUrl = authServerMeta.pushed_authorization_request_endpoint;
		const state = genRandom(16);
		const pkce = await generatePKCE();
		const dpopKey = await generateDPoPKey();
		const clientAssertJwt = await createClientAssertJWT(
			this.privateKey,
			clientMetadata.client_id,
			authServer,
			this.privateJwk.kid,
		);
		const parHeader = new Headers({ "Content-Type": "application/x-www-form-urlencoded" });
		const parBody = {
			client_id: clientMetadata.client_id,
			redirect_uri: clientMetadata.redirect_uris[0],
			code_challenge: pkce.challenge,
			code_challenge_method: pkce.method,
			state,
			login_hint: handleOrDid,
			response_mode: "query",
			response_type: "code",
			scope: clientMetadata.scope,
			client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
			client_assertion: clientAssertJwt,
		};
		const { res, nonce }: { res: { request_uri: string }; nonce: string | null } = await DPoPFetch(
			PARUrl,
			dpopKey,
			{
				method: "POST",
				body: jsonToFormurlencoded(parBody),
				headers: parHeader,
			},
		).then(async ({ res, nonce }) => ({ res: await res.json(), nonce }));
		//redisに保存
		const stateData: SavedState = {
			dpopKey: dpopKey.jwk,
			verifier: pkce.verifier,
			tokenEndpoint: authServerMeta.token_endpoint,
			authServer,
		};
		if (authServerMeta.authorization_response_iss_parameter_supported) stateData.iss = authServerMeta.issuer;
		if (nonce != null) stateData.nonce = nonce;
		await this.redis.set(`state_${state}`, JSON.stringify(stateData), { ex: 3600 });
		//リダイレクトのURLを生成
		const redirect_url = new URL(authServerMeta.authorization_endpoint);
		redirect_url.searchParams.set("client_id", clientMetadata.client_id);
		redirect_url.searchParams.set("request_uri", res.request_uri);
		return redirect_url;
	}
	async callback({ iss, state, code, error }: Record<string, string | null>) {
		const promises: Promise<unknown>[] = [];
		//エラー返してきた場合そのまま流す
		if (error != null) throw new ClientError(error);
		//stateかcodeがない場合エラー
		if (state == null || code == null) throw new ClientError("state or code missing");
		const savedState: SavedState | null = await this.redis.get(`state_${state}`);
		//保存したstateを削除、並列処理
		promises.push(this.redis.del(`state_${state}`));
		if (savedState == null) throw new ClientError("timeout");
		if (savedState.iss != null && savedState.iss !== iss) throw new ClientError("invalid issuer");
		const dpopKey = await restoreDPoPKey(savedState.dpopKey);
		//token交換
		const clientAssertJwt = await createClientAssertJWT(
			this.privateKey,
			clientMetadata.client_id,
			savedState.tokenEndpoint,
			this.privateJwk.kid,
		);
		const headers = new Headers({ "Content-Type": "application/x-www-form-urlencoded" });
		const body = {
			grant_type: "authorization_code",
			redirect_uri: clientMetadata.redirect_uris[0],
			code,
			code_verifier: savedState.verifier,
			client_id:clientMetadata.client_id,
			client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
			client_assertion: clientAssertJwt,
		};
		const tokenSet:tokenSet=await DPoPFetch(
			savedState.tokenEndpoint,
			dpopKey,
			{ headers, body: jsonToFormurlencoded(body), method: "POST" },
			savedState.nonce,
		).then(({res})=>res.json())
		//TODO tokenSet.subを検証
		//Redisに保存
		const saveSession:savedSession={tokenSet,dpopKey:dpopKey.jwk}
		promises.push(this.redis.set("session_"+tokenSet.sub,JSON.stringify(saveSession)))

		Promise.all(promises)
		return tokenSet.sub
	}
}

const createPubJwk = ({ kty, crv, x, y, use, alg }: JsonWebKey) => ({ kty, crv, x, y, use, alg });

async function createJWT(key: CryptoKey, header: object, body: object) {
	const headBody = `${b64Enc(JSON.stringify(header))}.${b64Enc(JSON.stringify(body))}`;
	const sig = await crypto.subtle.sign(
		{ name: "ECDSA", hash: { name: "SHA-256" } },
		key,
		new TextEncoder().encode(headBody),
	);
	const sigStr = b64Enc(String.fromCharCode(...new Uint8Array(sig)));
	return `${headBody}.${sigStr}`;
}

async function createClientAssertJWT(key: CryptoKey, clientId: string, authzServerURL: string, kid: string) {
	const uuid = crypto.randomUUID();
	const iat = Math.floor(Date.now() / 1000);
	const aud = new URL(authzServerURL).origin;
	const header = { alg: "ES256", kid };
	const body = { iss: clientId, sub: clientId, aud, jti: uuid, iat };
	return await createJWT(key, header, body);
}

async function DPoPFetch(
	url: string,
	{ key, jwk }: DPoPKey,
	{ method = "GET", headers: reqHeader, body }: { method?: "GET" | "POST"; headers?: HeadersInit; body?: BodyInit },
	initNonce?: string,
) {
	const headers = new Headers(reqHeader);
	const jwt1 = await createDPoPJWT(key, jwk, method, url, initNonce);
	headers.set("DPoP", jwt1);
	const res1 = await fetch(url, { method, headers, body });
	// console.log(`${res1.status} ${res1.statusText}`);
	// console.log(Array.from(res1.headers.entries()));
	if (res1.status !== 401 && res1.status !== 400) return { res: res1, nonce: null };
	const nonce = res1.headers.get("DPoP-Nonce");
	if (nonce == null) return { res: res1, nonce: null };
	// console.log("dpop fetch again with nonce");
	const jwt2 = await createDPoPJWT(key, jwk, method, url, nonce);
	headers.set("DPoP", jwt2);
	return { res: await fetch(url, { method, headers, body }), nonce };
}
async function createDPoPJWT(key: CryptoKey, jwk: JsonWebKey, mehtod: string, url: string, nonce?: string) {
	const jti = crypto.randomUUID(); //random token string (unique per request)
	const iat = Math.floor(Date.now() / 1000);
	const pubJwk = createPubJwk(jwk);
	const header = { typ: "dpop+jwt", alg: "ES256", jwk: pubJwk };
	const body = { jti, htm: mehtod, htu: url, iat, nonce };
	return await createJWT(key, header, body);
}

async function generatePKCE() {
	const verifier = genRandom(32);
	const verifierRaw = new TextEncoder().encode(verifier);
	const rawHash = await crypto.subtle.digest("SHA-256", verifierRaw);
	const challenge = b64Enc(String.fromCharCode(...new Uint8Array(rawHash)));
	const method = "S256";
	return { verifier, challenge, method };
}

async function generateDPoPKey(): Promise<DPoPKey> {
	const keypair = (await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, [
		"sign",
	])) as CryptoKeyPair;
	const jwk = (await crypto.subtle.exportKey("jwk", keypair.privateKey)) as JsonWebKey;
	return { key: keypair.privateKey, jwk };
}

function jsonToFormurlencoded(data: Record<string, string | number | undefined>) {
	const body = new URLSearchParams();
	for (const [key, value] of Object.entries(data)) {
		if (value == null) continue;
		body.append(key, String(value));
	}
	return body;
}

async function restoreDPoPKey(jwk: JsonWebKey): Promise<DPoPKey> {
	const key = await crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, true, ["sign"]);
	return { key, jwk };
}
