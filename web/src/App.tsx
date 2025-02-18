import { useEffect, useState } from "react";
import type { client } from "./main";
import { Box, CircularProgress, Container, Grid2 } from "@mui/material";

export function App({ client }: { client: client }) {
	const [state, setState] = useState<"loading" | "logout" | "github-none" | "github-name" | "github-oauth" | "error">(
		"loading",
	);
	//@ts-ignore デバッグ用
	// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
	useEffect(() => (globalThis.setState = setState), []);
	const [githubName, setGithubName] = useState<string>();
	useEffect(() => {
		client.status
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
	if (state === "loading")
		return (
			<Grid2 container justifyContent="center" alignItems="center" height="100%">
				<CircularProgress size={100} />
			</Grid2>
		);
	if (state === "error") return <>error</>;
	return (
		<>
			state:{state}
			<br />
			{githubName && `github:${githubName}`}
		</>
	);
}
