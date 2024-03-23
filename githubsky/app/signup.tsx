"use client";

import {
	type AtpSessionData,
	type AtpSessionEvent,
	BskyAgent,
} from "@atproto/api";

const userdata: {
	bsky_name?: string;
	bsky_password?: string;
	github_name?: string;
} = {};
export default function SignUpButton({
	accounttype,
	value,
}: { accounttype: string; value: string }) {
	const signup = async () => {
		if (accounttype === "bluesky") {
			const agent = new BskyAgent({
				service: "https://bsky.social",
				persistSession: (evt: AtpSessionEvent, sess?: AtpSessionData) => {
					// store the session-data for reuse
				},
			});
			window.alert(`連携が完了しました\n${JSON.stringify(userdata)}`);
		} else if (accounttype === "github") {
			const github_name = (
				document.getElementById("github_name") as HTMLInputElement
			).value;
			if (!github_name) return;
			const message = await fetch(`https://api.github.com/users/${github_name}`)
				.then((data) => data.json())
				.then((data) => {
					return data.message;
				});
			if (message) {
				window.alert("ユーザーが見つかりません");
				return;
			}
            userdata.github_name = github_name;
			window.alert(`連携が完了しました\n${JSON.stringify(userdata)}`);
		}
	};

	return <input type="button" value={value} onClick={signup} />;
}
