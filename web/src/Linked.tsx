import { Button, CircularProgress, Dialog, DialogActions, DialogTitle, Typography } from "@mui/material";
import { useState } from "react";
import { createCallable } from "react-call";
import { DepInfo, NoAuthError } from "./util";
import { notify } from "./Notify";
import type { client } from "./main";
import { InfoOutlined } from "@mui/icons-material";
import { githubNameData, githubOAuthData } from "./App";

export function GithubName({
	data,
	client,
	onSessionTimeout,
}: { data: githubNameData; client: client; onSessionTimeout: () => void }) {
	const [OAuthSending, setOAuthSending] = useState(false);
	const [exitSending, setExitSending] = useState(false);
	const handleOAuthLink = async () => {
		setOAuthSending(true);
		try {
			const url = await client.github_login.$post().then<string | number>((r) => (r.ok ? r.text() : r.status));
			if (typeof url === "number") throw url === 401 ? new NoAuthError() : new Error();

			location.href = url;
		} catch (e) {
			setOAuthSending(false);
			if (e instanceof NoAuthError) {
				notify("セッションが切れました");
				return onSessionTimeout();
			}
			notify("エラーが発生しました");
		}
	};
	const handleExit = async () => {
		await ConfirmExit.call();
		setExitSending(true);
		try {
			const res = await client.exit.$delete().then(async (res) => {
				const data = await res.json();
				if (!data.success) {
					if (res.status === 401) throw new NoAuthError();
					return data.error;
				}
			});
			if (res != null) {
				notify(res);
			} else {
				location.href = "/";
			}
		} catch (e) {
			setExitSending(false);
			if (e instanceof NoAuthError) {
				notify("セッションが切れました");
				return onSessionTimeout();
			}
			notify("エラーが発生しました");
		}
	};

	return (
		<>
			<Typography sx={{ mb: 1 }}>
				あなたは今
				<Typography component="span" sx={{ fontWeight: 700 }}>
					{data.github_name}
				</Typography>
				で名前で連携しています
				<br />
				名前での連携は非推奨です
				<Button onClick={() => DepInfo.call()} variant="text">
					<InfoOutlined sx={{ fontSize: 15 }} />
					理由
				</Button>
			</Typography>
			<Button onClick={handleOAuthLink} variant="contained">
				{OAuthSending ? <CircularProgress size={24.5} /> : "OAuth連携に変更"}
			</Button>
			<Button onClick={handleExit} variant="outlined" color="error" sx={{ mt: 5 }}>
				退会する
			</Button>
			<ConfirmExit.Root />
		</>
	);
}

export function GithubOAuth({
	data,
	client,
	onSessionTimeout,
}: { data: githubOAuthData; client: client; onSessionTimeout: () => void }) {
	const [OAuthSending, setOAuthSending] = useState(false);
	const handleExit = async () => {
		await ConfirmExit.call();
	};

	return (
		<>
			<Typography sx={{ mb: 1 }}>OAuthで連携済みです</Typography>
			<Button onClick={handleExit} variant="outlined" color="error" sx={{ mt: 5 }}>
				退会する
			</Button>
			<ConfirmExit.Root />
		</>
	);
}

const ConfirmExit = createCallable<void, boolean>(({ call }) => (
	<>
		<Dialog
			aria-describedby="alert-dialog-description"
			aria-labelledby="alert-dialog-title"
			onClose={() => call.end(false)}
			open={!call.ended}
		>
			<DialogTitle id="alert-dialog-title">本当に退会しますか？</DialogTitle>
			<DialogActions sx={{ gap: 1 }}>
				<Button autoFocus onClick={() => call.end(false)} variant="contained">
					いいえ
				</Button>
				<Button onClick={() => call.end(true)} variant="outlined" color="error">
					退会
				</Button>
			</DialogActions>
		</Dialog>
	</>
));
