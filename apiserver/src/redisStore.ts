export class RedisStore {
	private REDIS_URL: string;
	private REDIS_TOKEN: string;
	private prefix: string;
	private ex?: number;
	constructor(prefix: string, ex?: number) {
		const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
		const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
		if (!REDIS_URL || !REDIS_TOKEN) {
			throw new Error("upstash_redisの環境変数がないよ");
		}
		this.REDIS_URL = REDIS_URL;
		this.REDIS_TOKEN = REDIS_TOKEN;
		this.prefix = prefix;
		this.ex = ex;
	}
	async set(sub: string, stateData: unknown) {
		const key = `${this.prefix}_${sub}`;
		await fetch(`${this.REDIS_URL}/set/${key}${typeof this.ex === "number" ? `?ex=${this.ex}` : ""}`, {
			method: "POST",
			body: JSON.stringify(stateData),
			headers: {
				Authorization: `Bearer ${this.REDIS_TOKEN}`,
			},
		});
	}
	async get(sub: string) {
		const key = `${this.prefix}_${sub}`;
		const res = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/${key}`, {
			headers: {
				Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
			},
		});
		if (!res.ok) {
			return;
		}
		return JSON.parse(((await res.json()) as { result: string }).result);
	}
	async del(sub: string) {
		const key = `${this.prefix}_${sub}`;
		await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/del/${key}`, {
			headers: {
				Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
			},
		});
	}
}
