import { Supabase } from "@githubsky/common";
import { createPost } from "./bsky";
import { createClient } from "./client";
import { getUsersGithubData } from "./github";

async function main() {
	const db = new Supabase();
	const users = await db.getUsers();
	const client = await createClient();
	for (const user of users) {
		const ghData = await getUsersGithubData(user);
		// await createPost({ did: user.DID, supabase: db, client, data: ghData });
		console.log(ghData)
	}
}
process.env.SUPABASE_ENV = "userdata_v2";
main();
