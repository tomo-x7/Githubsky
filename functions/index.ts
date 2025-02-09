import { hc } from "hono/client";
import type { ServerType } from "./api/[[path]]";

export function createClient() {
	return hc<ServerType>("/");
}
