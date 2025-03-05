import { CircularProgress, Grid2 } from "@mui/material";
import { useEffect, useState } from "react";
import { BskyLogin } from "./BskyLogin";
import { GithubNone } from "./GithubLogin";
import { Linked } from "./Linked";
import type { client } from "./main";
import { Finish } from "./Finish";

export function App({ client }: { client: client }) {
	const [state, setState] = useState<
		"loading" | "logout" | "github-none" | "github-name" | "github-oauth" | "error" | "finish"
	>("loading");
	const [githubData, setGithubData] = useState<githubData>();
	const onSessionTimeout = () => setState("logout");
	const onFinish = () => setState("finish");
	useEffect(() => {
		if (location.search.includes("callback=githuboauth")) {
			history.replaceState(null,"","/")
			return setState("finish");
		}
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
	if (state === "logout") return <BskyLogin client={client} />;
	if (state === "github-none")
		return <GithubNone client={client} onSessionTimeout={onSessionTimeout} onFinish={onFinish} />;
	if (state === "github-name" && githubData?.github === "name")
		return <Linked data={githubData} {...{ client, onSessionTimeout }} />;
	if (state === "github-oauth" && githubData?.github === "oauth")
		return <Linked data={githubData} {...{ client, onSessionTimeout }} />;
	if (state === "finish") return <Finish />;
	return <>error</>;
}

export type githubNameData = { github: "name"; github_name: string };
export type githubOAuthData = { github: "oauth"; github_name: string; avatar_url: string };
export type githubData = githubNameData | githubOAuthData;
