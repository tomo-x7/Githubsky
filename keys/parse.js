//@ts-check
import { execSync } from "node:child_process";
import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const filelist = readdirSync(import.meta.dirname)
	.filter((v) => /.*.pem/.test(v))
	.map((v) => v.split(".")[0]);
const keyset={}
for (const filename of filelist) {
	const jwkStr = execSync(`pnpm eckles ${filename}.pem`).toString();
	const jwkObj = JSON.parse(jwkStr);
	jwkObj.kid = filename;
	writeFileSync(`jwk${filename}.jwk`, JSON.stringify(jwkObj));
	keyset[filename]=JSON.stringify(jwkObj)
}
let keypairstr=""
for (const key in keyset) {
	keypairstr+=`${key.toUpperCase()}=${keyset[key]}\n`
}
writeFileSync("keyset",keypairstr);