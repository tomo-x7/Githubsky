import { InfoOutlined } from "@mui/icons-material";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	TextField,
	Typography,
} from "@mui/material";
import { useState } from "react";
import { createCallable } from "react-call";
import { notify } from "./Notify";
import type { client } from "./main";
import { DepInfo, NoAuthError } from "./util";

export function GithubNone({ client, onSessionTimeout }: { client: client; onSessionTimeout: () => void }) {
	const [name, setName] = useState("");
	const [OAuthSending, setOAuthSending] = useState(false);
	const [nameSending, setNameSending] = useState(false);
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
	const handleInputName = (ev: React.ChangeEvent<HTMLInputElement>) => setName(ev.target.value);
	const handleNameLink = async () => {
		const ok = await ConfirmName.call();
		if (!ok) return;
		setNameSending(true);
		try {
			const res = await client.github_name.$post({ json: { name } }).then((r) => r.json());
			setNameSending(false);
		} catch (e) {
			setNameSending(false);
		}
	};

	return (
		<>
			<Typography sx={{ mb: 3 }} variant="h5">
				Githubと連携する
			</Typography>
			<Button onClick={handleOAuthLink} variant="contained" loading={OAuthSending}>
				OAuth連携
			</Button>
			<Divider sx={{ mt: 3 }}>
				または名前で連携
				<Button onClick={() => DepInfo.call()} variant="text">
					<InfoOutlined sx={{ fontSize: 15 }} />
					非推奨
				</Button>
			</Divider>
			<TextField label="Github username" onChange={handleInputName} sx={{ mb: 2 }} variant="standard" />
			<Button disabled={name === ""} onClick={handleNameLink} variant="outlined" loading={nameSending}>
				名前で連携
			</Button>
			<ConfirmName.Root />
		</>
	);
}

const ConfirmName = createCallable<void, boolean>(({ call }) => (
	<>
		<Dialog
			aria-describedby="alert-dialog-description"
			aria-labelledby="alert-dialog-title"
			onClose={() => call.end(false)}
			open={!call.ended}
		>
			<DialogTitle id="alert-dialog-title">名前での連携は非推奨です。本当によろしいですか？</DialogTitle>
			<DialogContent>
				<DialogContentText id="alert-dialog-description">
					名前での連携ではパブリックリポジトリのデータのみが反映されます。
					プライベートリポジトリへのコミット数を取得するためにはOAuth連携が必要です。 本当によろしいですか？
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button autoFocus onClick={() => call.end(false)} variant="contained">
					いいえ
				</Button>
				<Button onClick={() => call.end(true)} variant="outlined">
					はい
				</Button>
			</DialogActions>
		</Dialog>
	</>
));
