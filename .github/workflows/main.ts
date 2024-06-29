import { post } from "./bsky";
import { type UserData, getUsersList, supabasesetting, writelog } from "./supabase";
import { getUsersGithubData, type week } from "./github";
import { cryptosetting } from "./mycrypto";
import { getimg } from "./api";
const main = async () => {
	supabasesetting(process.argv[2], process.argv[3]);
	cryptosetting(process.argv[4]);
	const userslist = await getUsersList();

	for (const i in userslist) {
		try {
			const userdata: UserData & { count?: number; lastweek?: week; star?: number } = userslist[i];
			Object.assign(userdata, await getUsersGithubData(userdata.github_name, userdata.Github_token));
			if (userdata.count !== undefined && userdata.lastweek !== undefined) {
				const sum =
					userdata.lastweek[0] +
					userdata.lastweek[1] +
					userdata.lastweek[2] +
					userdata.lastweek[3] +
					userdata.lastweek[4] +
					userdata.lastweek[5] +
					userdata.lastweek[6];
				if (sum !== 0) {
					//APIを叩いて画像取得
					const imgblob = await getimg(userdata.count, userdata.lastweek, userdata.star);
					post(
						userdata.bsky_password,
						userdata.github_name,
						userdata.count,
						userdata.id,
						userdata.fail_count,
						userdata.DID,
						imgblob || undefined,
						userdata.PDS,
					);
				} else {
					console.log(`no commit ${userdata.id}`);
				}
			} else {
				await writelog(`${userdata.DID}:何かおかしい\n${userdata.count}\n${userdata.lastweek}`);
			}
		} catch (e) {
			await writelog(e);
		}
	}

	//
};

main();
