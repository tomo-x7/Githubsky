import { Redis } from "@upstash/redis/cloudflare";
import type { secrets } from "..";
import { OAuthClient } from "./index";
const c = await OAuthClient.init(process.env as secrets, Redis.fromEnv());
console.log(await c.login("tomo-x.bsky.social"));
