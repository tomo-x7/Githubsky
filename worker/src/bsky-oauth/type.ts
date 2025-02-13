type resourceServer = {
	resource: string;
	authorization_servers: string[];
	bearer_methods_supported: string[];
	resource_documentation: string;
};
type authServer = {
	issuer: string;
	scopes_supported: string[];
	subject_types_supported: string[];
	response_types_supported: string[];
	response_modes_supported: string[];
	grant_types_supported: string[];
	code_challenge_methods_supported: string[];
	ui_locales_supported: string[];
	display_values_supported: string[];
	authorization_response_iss_parameter_supported: boolean;
	request_object_signing_alg_values_supported: string[];
	request_object_encryption_alg_values_supported: [];
	request_object_encryption_enc_values_supported: [];
	request_parameter_supported: boolean;
	request_uri_parameter_supported: boolean;
	require_request_uri_registration: boolean;
	jwks_uri: string;
	authorization_endpoint: string;
	token_endpoint: string;
	token_endpoint_auth_methods_supported: string[];
	token_endpoint_auth_signing_alg_values_supported: string[];
	revocation_endpoint: string;
	introspection_endpoint: string;
	pushed_authorization_request_endpoint: string;
	require_pushed_authorization_requests: boolean;
	dpop_signing_alg_values_supported: string[];
	client_id_metadata_document_supported: boolean;
};

type DPoPKey = { key: CryptoKey; jwk: JsonWebKey };
type SavedState = {
	iss?: string;
	dpopKey: JsonWebKey;
	verifier: pkce["verifier"];
	nonce?: string;
	tokenEndpoint: string;
	authServer: string;
};
type pkce = {
	verifier: string;
	challenge: string;
	method: string;
};

type tokenSet = {
	access_token: string;
	token_type: "DPoP";
	refresh_token: string;
	scope: string;
	expires_in: number;
	sub: string;
};
type savedSession = { tokenSet: tokenSet; dpopKey: JsonWebKey };
