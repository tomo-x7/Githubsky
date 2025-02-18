import { useEffect, useState } from "react";
import type { client } from "./main";

export function App({ client }: { client: client }) {
	const [state, setState] = useState<"loading" | "logout" | "github-none" | "github-name" | "github-oauth" | "error">(
		"loading",
	);
	const [githubName, setGithubName] = useState<string>();
	useEffect(() => {
		client.api.status
			.$get()
			.then((res) => res.json())
			.catch((err) => {
				console.error(err);
				setState("error");
			})
			.then((data) => {
				if (data == null) return;
				if (data.bsky === false) {
					return void setState("logout");
				}
				if (data.github === "none") {
					return void setState("github-none");
				}
				if (data.github === "name") {
					setState("github-name");
					setGithubName(data.github_name);
					return;
				}
				if (data.github === "oauth") {
					setState("github-oauth");
					setGithubName(data.github_name);
					return;
				}
				setState("error"); //never
			});
	}, [client]);
	return (
		<>
			state:{state}
			<br />
			{githubName && `github:${githubName}`}
		</>
	);
}
