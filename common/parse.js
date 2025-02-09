//@ts-check
import { execSync } from "node:child_process";
import { readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const filelist = readdirSync(path.join(import.meta.dirname, "keys"))
	.filter((v) => /.*.pem/.test(v))
	.map((v) => v.split(".")[0]);
const keyset = {};
for (const filename of filelist) {
	const jwkStr = execSync(`pnpm eckles keys/${filename}.pem`).toString();
	const jwkObj = JSON.parse(jwkStr);
	jwkObj.kid = filename;
	writeFileSync(path.join("keys", `jwk${filename}.jwk`), JSON.stringify(jwkObj));
	keyset[filename] = JSON.stringify(jwkObj);
}
let keypairstr = "";
for (const key in keyset) {
	keypairstr += `${key.toUpperCase()}=${keyset[key]}\n`;
}
writeFileSync(path.join("keys", "keyset"), keypairstr);
