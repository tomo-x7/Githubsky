import { Supabase } from "../../common";
import { createClient } from "./client";
import { getUsersGithubData } from "./github";
import { createImg } from "./image";
import { createPost } from "./bsky";

async function main() {
	const db = new Supabase();
	const users = await db.getUsers();
	const client = await createClient();
	for (const user of users) {
		const ghData = await getUsersGithubData(user);
		const image = createImg(ghData);
		await createPost({ did: user.DID, supabase: db, client, data: ghData, image });
		console.log(ghData);
	}
}
process.env.SUPABASE_ENV = "userdata_v2";
main();
