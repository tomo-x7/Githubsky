import { CircularProgress, Grid2 } from "@mui/material";
import { useEffect, useState } from "react";
import { BskyLogin } from "./BskyLogin";
import { GithubNone } from "./GithubLogin";
import { GithubName, GithubOAuth } from "./Linked";
import type { client } from "./main";

export function App({ client }: { client: client }) {
	const [state, setState] = useState<"loading" | "logout" | "github-none" | "github-name" | "github-oauth" | "error">(
		"loading",
	);
	const [githubData, setGithubData] = useState<githubData>();
	const onSessionTimeout = () => setState("logout");
	useEffect(() => {
		client.status
			.$get()
			.then((res) => res.json())
			.catch((err) => {
				console.error(err);
				setState("error");
			})
			.then((data) => {
				if (data == null) return void setState("error");
				if (data.bsky === false) {
					return void setState("logout");
				}
				if (data.github === "none") {
					return void setState("github-none");
				}
				if (data.github === "name") {
					setState("github-name");
					setGithubData(data);
					return;
				}
				if (data.github === "oauth") {
					setState("github-oauth");
					setGithubData(data);
					return;
				}
				setState("error"); //never
			});
	}, [client]);
	if (state === "loading")
		return (
			<Grid2 alignItems="center" container height="100%" justifyContent="center">
				<CircularProgress size={100} />
			</Grid2>
		);
	if (state === "error") return <>error</>;
	if (state === "logout") return <BskyLogin client={client} />;
	if (state === "github-none") return <GithubNone client={client} onSessionTimeout={onSessionTimeout} />;
	if (state === "github-name")
		return <GithubName data={{ github: "name", github_name: "hogehoge" }} {...{ client, onSessionTimeout }} />;
	if (state === "github-oauth")
		return (
			<GithubOAuth
				data={{
					github: "oauth",
					github_name: "hogehoge",
					avatar_url: "https://avatars.githubusercontent.com/u/158121497?v=4",
				}}
				{...{ client, onSessionTimeout }}
			/>
		);
	console.log(state);
	return (
		<>
			state:{state}
			<br />
			{githubData && `github:${githubData}`}
		</>
	);
}

export type githubNameData = { github: "name"; github_name: string };
export type githubOAuthData = { github: "oauth"; github_name: string; avatar_url: string };
export type githubData = githubNameData | githubOAuthData;
