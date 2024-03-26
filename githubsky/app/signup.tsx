import { type AtpSessionData, type AtpSessionEvent, BskyAgent } from "@atproto/api";
import Link from "next/link";
import style from "./page.module.css";

const userdata: {
	DID?: string;
	bsky_password?: string;
	github_name?: string;
} = {};

export default function SignUpButton({ accounttype, value }: { accounttype: string; value: string }) {
	const signup = async () => {
		if (accounttype === "bluesky") {
			
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			document.getElementById("step2")!.style.visibility = "visible";
		} else if (accounttype === "github") {
			
		} else if (accounttype === "finish") {
		}
	};

	return <input type="button" value={value} onClick={signup} />;
}