import { post } from "./bsky";
import {
	type UserData,
	getUsersList,
	supabasesetting,
	writelog,
} from "./supabase";
import { getUsersGithubData, type week } from "./github";
import { cryptosetting } from "./mycrypto";
const main = async () => {
	supabasesetting(process.argv[2], process.argv[3]);
	cryptosetting(process.argv[4])
	const userslist = await getUsersList();

	for (const i in userslist) {
		try {
			const userdata: UserData & { count?: number; lastweek?: week } =
				userslist[i];
			Object.assign(userdata, await getUsersGithubData(userdata.github_name));
			if (userdata.count !== undefined && userdata.count !== 0) {
				//APIを叩いて画像取得
				post(
					userdata.bsky_handle,
					userdata.bsky_password,
					userdata.github_name,
					userdata.count,
					userdata.id,
					userdata.fail_count,
					userdata.DID
				);
			} else {
				console.log("nocommit");
			}
		} catch (e) {
			writelog(e);
		}
	}

	//
};

main();
