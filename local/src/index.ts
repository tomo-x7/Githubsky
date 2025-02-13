import { Supabase } from "@githubsky/common";
import { getUsersGithubData } from "./github";
import { createPost } from "./bsky";
import { createClient } from "./client";

async function main() {
	const db = new Supabase();
	const users = await db.getUsers();
	const client = await createClient();
	for (const user of users) {
		const ghData = await getUsersGithubData(user);
		await createPost({ data: ghData, did: user.DID, supabase: db, client });
	}
}
process.env.SUPABASE_ENV = "userdata_v2";
main();
