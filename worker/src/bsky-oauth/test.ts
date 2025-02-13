import { Redis } from "@upstash/redis/cloudflare";
import type { secrets } from "..";
import { OAuthClient } from "./index";
const c = await OAuthClient.init(process.env as secrets, Redis.fromEnv(process.env as secrets));
console.log(await c.login("tomo-x.bsky.social"));
