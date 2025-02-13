import { type SupabaseClient, createClient } from "@supabase/supabase-js";
import type { Database } from "./supabasetype";
export class Supabase {
	public client: SupabaseClient<Database>;
	private table: "userdata_v2" | "test";
	constructor(env:Record<string,string|undefined>=process.env) {
		if (!env.SUPABASE_URL || !env.SUPABASE_KEY) {
			throw new Error("環境変数を正しく設定してください");
		}
		this.client = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_KEY);
		this.table = (env.SUPABASE_ENV ?? "test") as typeof this.table;
	}
	async getUsers() {
		const { data, error } = await this.client.from(this.table).select();
		if (error || !data) {
			throw error;
		}
		return data;
	}
	async deleteUser({ did }: { did: string }) {
		const { data, error } = await this.client.from(this.table).delete().eq("DID", did).select();
		if (error) {
			console.error(error);
			return;
		}
	}
	async success({ did }: { did: string }) {
		const { error } = await this.client.from(this.table).update({ fail_count: 0 }).eq("DID", did);
		if (error) console.error(error);
	}
	async fail({ did, fail_count }: { did: string; fail_count: number }) {
		const { error } = await this.client
			.from(this.table)
			.update({ fail_count: fail_count + 1 })
			.eq("DID", did);
		if (error) console.error(error);
	}
}
