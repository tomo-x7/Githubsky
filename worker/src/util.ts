export abstract class CustomError extends Error {
	message = "";
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
