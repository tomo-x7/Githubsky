import { Hono } from "hono";
import {NodeOAuthClient} from "@atproto/oauth-client-node"
import { JoseKey } from "@atproto/jwk-jose";
import { RedisStore } from "./redisStore.js";
const bskyapp=new Hono()
if(!(process.env.PRIVATE_KEY_1&&process.env.PRIVATE_KEY_2&&process.env.PRIVATE_KEY_3)){
    throw new Error("PRIVATE_KEYの環境変数が正しく設定されていません")
}
const client=new NodeOAuthClient({clientMetadata: {
    client_id: 'https://my-app.com/client-metadata.json',
    client_name: 'Githubsky',
    client_uri: 'https://githubsky.pages.dev',
    // logo_uri: 'https://my-app.com/logo.png',
    // tos_uri: 'https://my-app.com/tos',
    // policy_uri: 'https://my-app.com/policy',
    redirect_uris: ['https://my-app.com/callback'],
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    application_type: 'web',
    token_endpoint_auth_method: 'private_key_jwt',
    dpop_bound_access_tokens: true,
    jwks_uri: 'https://my-app.com/jwks.json',
  },keyset: await Promise.all([
    JoseKey.fromImportable(process.env.PRIVATE_KEY_1),
    JoseKey.fromImportable(process.env.PRIVATE_KEY_2),
    JoseKey.fromImportable(process.env.PRIVATE_KEY_3),
  ]),stateStore: new RedisStore("state"),sessionStore: new RedisStore("session"),})

bskyapp.get