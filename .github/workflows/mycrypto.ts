import crypto from "node:crypto";

let crypto_key:string|undefined
export const cryptosetting = (paramcrypto_key: string) => {
	crypto_key=paramcrypto_key
};



export const decrypt = (crypted_text: string,paramiv:string): string => {
	if (!crypto_key) throw new Error("Please run settings before");
	const iv = Buffer.from(paramiv)
	const encryptedText = Buffer.from(crypted_text, "hex")
	const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(crypto_key), iv)
	let decrypted = decipher.update(encryptedText)
  
	decrypted = Buffer.concat([decrypted, decipher.final()])
  
	return decrypted.toString()
};