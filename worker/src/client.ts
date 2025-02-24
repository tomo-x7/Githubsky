import { hc } from "hono/client";
import type { schema } from ".";

export function createClient() {
	return hc<schema>("/").api;
}
