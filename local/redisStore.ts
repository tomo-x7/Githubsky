async function setredis(key: string, value: unknown, ex: undefined | number = undefined) {
	await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/${key}${typeof ex === "number" ? `?ex=${ex}` : ""}`, {
		method: "POST",
		body: JSON.stringify(value),
		headers: {
			Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
		},
	});
}
async function getredis(key: string) {
	const res = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/${key}`, {
		headers: {
			Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
		},
	});
	if (!res.ok) {
		return;
	}
	return JSON.parse((await res.json()).result);
}
async function delredis(key: string) {
	await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/del/${key}`, {
		headers: {
			Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
		},
	});
}

export function createStore(prefix: string, ex?: number) {
	return {
		set: async (sub: string, stateData: unknown) => setredis(`${prefix}_${sub}`, stateData, ex),
		get: (key: string) => getredis(`${prefix}_${key}`),
		del: (key: string) => delredis(`${prefix}_${key}`),
	};
}
