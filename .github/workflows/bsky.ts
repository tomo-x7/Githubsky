import { type AtpSessionData, type AtpSessionEvent, BskyAgent } from "@atproto/api";



export const post=async (handle:string,password:string)=>{
	const agent = new BskyAgent({
		service: "https://bsky.social",
		persistSession: (evt: AtpSessionEvent, sess?: AtpSessionData) => {
			// store the session-data for reuse
		},
	});

	await agent.login({
		identifier: handle,
		password: password,
	});
	
	await agent.post({
		text: "APIのテスト",
		createdAt: new Date().toISOString(),
	});
}