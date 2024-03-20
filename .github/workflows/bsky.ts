import { type AtpSessionData, type AtpSessionEvent, BskyAgent, RichText } from "@atproto/api";
import type { week } from "./github";
import { fail, writelog } from "./supabase";



export const post=async (bsky_handle:string,bsky_password:string,github_name:string,commitcount:number|string,id:number,fail_count:number)=>{
	try{
	const agent = new BskyAgent({
		service: "https://bsky.social",
		persistSession: (evt: AtpSessionEvent, sess?: AtpSessionData) => {
			// store the session-data for reuse
		},
	});

	await agent.login({
		identifier: bsky_handle,
		password: bsky_password,
	});

	const message=new RichText({text:`今日はGitHubに${commitcount}回commitしました\n#Githubsky\nhttps://github.com/${github_name}`})
	message.detectFacets(agent)
	await agent.post({
		text: message.text,
		facets:message.facets,
		createdAt: new Date().toISOString(),
	});
}catch(e){
	writelog(`${bsky_handle}の投稿時エラー\n${e}`)
	fail(id,fail_count)
}
}