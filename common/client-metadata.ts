import type { ClientMetadata } from "@atproto/oauth-client-node";

const SERVER_DOMAIN = "githubsky.pages.dev" as const;
export const clientMetadata: ClientMetadata = {
	// Must be a URL that will be exposing this metadata
	client_id: `https://${SERVER_DOMAIN}/api/client-metadata.json`,
	client_name: "githubsky",
	client_uri: `https://${SERVER_DOMAIN}/`,
	// logo_uri: `https://${SERVER_DOMAIN}/next.svg`,
	// tos_uri: `https://${SERVER_DOMAIN}/tos`,
	// policy_uri: `https://${SERVER_DOMAIN}/policy`,
	redirect_uris: [`https://${SERVER_DOMAIN}/api/callback`],
	scope: "atproto transition:generic",
	grant_types: ["authorization_code", "refresh_token"],
	response_types: ["code"],
	application_type: "web",
	token_endpoint_auth_method: "private_key_jwt",
	dpop_bound_access_tokens: true,
	jwks_uri: `https://${SERVER_DOMAIN}/api/jwks.json`,
	token_endpoint_auth_signing_alg: "ES256",
};
