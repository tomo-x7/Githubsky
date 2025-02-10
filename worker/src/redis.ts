import { Redis as redisClient } from "@upstash/redis/cloudflare";

export class Redis {
	private redisClient: redisClient;
	constructor() {
		this.redisClient = redisClient.fromEnv();
	}
	/**@param ex 期限切れになるまでの秒数 */
	async setredis(key: string, value: object | string, ex?: number) {
		await this.redisClient.set(key, value, typeof ex === "number" ? { ex } : undefined);
	}
	async getredis(key: string, parse = true) {
		const res = await this.redisClient.get(key);
		return parse && typeof res === "string" ? JSON.parse(res) : res;
	}
	async delredis(key: string) {
		await this.redisClient.del(key);
	}
}
