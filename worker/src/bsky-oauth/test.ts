import type { secrets } from "..";
import { OAuthClient } from "./index";

const c = await OAuthClient.init(process.env as secrets);
console.log(await c.login("tomo-x.bsky.social",""));
