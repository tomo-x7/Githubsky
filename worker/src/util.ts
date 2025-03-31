export abstract class CustomError extends Error {
	message = "nolog";
	isClientError = false;
}
export class ClientError extends Error implements CustomError {
	message: string;
	isClientError = true;
	constructor(message: string) {
		super(message);
		this.message = message;
	}
}
export class ServerError extends Error implements CustomError {
	message: string;
	isClientError = false;
	constructor(message: string) {
		super(message);
		this.message = message;
	}
}

export const b64Enc = (s: string) => btoa(s).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
export const genRandom = (bytes: number) =>
	b64Enc(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(bytes))));

type githubNoneType = { github: "none" };
type githubNameType = { github: "name"; github_name: string };
type githubOAuthType = { github: "oauth"; github_name: string; avatar_url: string };
type githubType = githubNoneType | githubNameType | githubOAuthType;
export type statusReturn =
	| { bsky: false; github: "none" }
	| ({ bsky: true; bskyName: string; bskyAvatar: string | undefined } & githubType);

type exitFailed = { success: false; error: string };
type exitSUccessed = { success: true };
export type exitReturn = exitFailed | exitSUccessed;
