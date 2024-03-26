import {
	type AtpSessionData,
	type AtpSessionEvent,
	BskyAgent,
	RichText,
} from "@atproto/api";
import { fail, success, writelog } from "./supabase";

export const post = async (
	bsky_password: string,
	github_name: string,
	commitcount: number | string,
	id: number,
	fail_count: number,
	DID: string,
) => {
	try {
		const agent = new BskyAgent({
			service: "https://bsky.social",
			persistSession: (evt: AtpSessionEvent, sess?: AtpSessionData) => {
				// store the session-data for reuse
			},
		});

		await agent.login({
			identifier: DID,
			password: bsky_password,
		});

		const message = new RichText({
			text: `今日はGitHubに${commitcount}回commitしました\n#Githubsky\nhttps://github.com/${github_name}`,
		});
		message.detectFacets(agent);
		// await agent.post({
		// 	text: message.text,
		// 	facets:message.facets,
		// 	createdAt: new Date().toISOString(),
		// });
		success(id);
	} catch (e) {
		writelog(`${DID}の投稿時エラー\n${e}`);
		fail(id, fail_count);
	}
};
