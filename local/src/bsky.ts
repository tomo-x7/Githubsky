import { Agent } from "@atproto/api";
import type { NodeOAuthClient, OAuthSession } from "@atproto/oauth-client-node";
import type { Supabase } from "@githubsky/common";

export async function createPost({
	did,
	/*data,*/ supabase,
	client,
}: { did: string /*data: GithubData;*/; supabase: Supabase; client: NodeOAuthClient }) {
	let session: OAuthSession;
	try {
		session = await client.restore(did);
	} catch {
		session = await client.restore(did);
	}
	const agent = new Agent(session);
	// try {
	// 	const message = new RichText({
	// 		text: `昨日はGitHubに${data.count}回commitしました\n#Githubsky\nhttps://github.com/${data.github_name}`,
	// 	});
	// 	message.detectFacets(agent);
	// 	const imgblob: Blob = new Blob([]);
	// 	if (imgblob) {
	// 		//画像の取得に成功した場合、画像付きでポスト
	// 		const dataArray: Uint8Array = new Uint8Array(await imgblob.arrayBuffer());
	// 		const { data } = await agent.uploadBlob(dataArray, {
	// 			// 画像の形式を指定 ('image/jpeg' 等の MIME タイプ)
	// 			encoding: imgblob.type,
	// 		});
	// 		await agent.post({
	// 			text: message.text,
	// 			facets: message.facets,
	// 			langs: ["ja"],
	// 			createdAt: new Date().toISOString(),
	// 			embed: {
	// 				$type: "app.bsky.embed.external",
	// 				external: {
	// 					uri: "https://githubsky.vercel.app/",
	// 					thumb: {
	// 						$type: "blob",
	// 						ref: {
	// 							$link: data.blob.ref.toString(),
	// 						},
	// 						mimeType: data.blob.mimeType,
	// 						size: data.blob.size,
	// 					},
	// 					title: "Githubsky",
	// 					description: "",
	// 				},
	// 			},
	// 		});
	// 	} else {
	// 		console.error(`${agent.did}の画像取得エラー`);
	// 	}
	// 	supabase.success({ did: agent.assertDid });
	// } catch (e) {
	// 	console.error(`${agent.did}の投稿時エラー\n${e}`);
	// 	supabase.fail({ did: agent.assertDid, fail_count: 0 });
	// }
}
