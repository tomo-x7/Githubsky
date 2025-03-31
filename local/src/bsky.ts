import { Agent, RichText } from "@atproto/api";
import type { NodeOAuthClient } from "@atproto/oauth-client-node";
import type { Supabase } from "../../common/";
import type { GithubData } from "./github";

export async function createPost({
	did,
	data,
	supabase,
	client,
	image,
}: { did: string; data: GithubData; supabase: Supabase; client: NodeOAuthClient; image: Buffer }) {
	const session = await client.restore(did);

	const agent = new Agent(session);
	try {
		const message = new RichText({
			text: `昨日はGitHubに${data.count}回commitしました\n#Githubsky\nhttps://github.com/${data.github_name}`,
		});
		message.detectFacets(agent);
		const dataArray: Uint8Array = new Uint8Array(image);
		const {
			data: { blob },
		} = await agent.uploadBlob(dataArray, {
			// 画像の形式を指定 ('image/jpeg' 等の MIME タイプ)
			encoding: "image/png",
		});
		await agent.post({
			text: message.text,
			facets: message.facets,
			langs: ["ja"],
			createdAt: new Date().toISOString(),
			embed: {
				$type: "app.bsky.embed.external",
				external: {
					uri: "https://githubsky.tomo-x.win/",
					thumb: {
						$type: "blob",
						ref: {
							$link: blob.ref.toString(),
						},
						mimeType: blob.mimeType,
						size: blob.size,
					},
					title: "Githubsky",
					description: "",
				},
			},
		});

		supabase.success({ did: agent.assertDid });
	} catch (e) {
		console.error(`${agent.did}の投稿時エラー\n${e}`);
		supabase.fail({ did: agent.assertDid, fail_count: 0 });
	}
}
