import { InfoOutlined } from "@mui/icons-material";
import {
	Button,
	CircularProgress,
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
				2.Githubと連携する
			</Typography>
			<Button onClick={handleOAuthLink} variant="contained">
				{OAuthSending ? <CircularProgress size={24.5} /> : "OAuth連携"}
			</Button>
			<Divider sx={{ mt: 3 }}>
				または名前で連携
				<Button onClick={() => DepInfo.call()} variant="text">
					<InfoOutlined sx={{ fontSize: 15 }} />
					非推奨
				</Button>
			</Divider>
			<TextField label="Github username" onChange={handleInputName} sx={{ mb: 2 }} variant="standard" />
			<Button disabled={name === ""} onClick={handleNameLink} variant="outlined">
				{nameSending ? <CircularProgress size={24.5} /> : "名前で連携"}
			</Button>
			<DepInfo.Root />
			<ConfirmName.Root />
		</>
	);
}

const DepInfo = createCallable(
	({ call }) => (
		<>
			<Dialog
				aria-describedby="alert-dialog-description"
				aria-labelledby="alert-dialog-title"
				onClose={() => call.end()}
				open={!call.ended}
			>
				<DialogTitle id="alert-dialog-title">名前での連携は非推奨です</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						OAuth連携をすることで、プライベートリポジトリへのコミット数も取得することができます。
						コミット数とスター数以外の情報は公開されません。ぜひOAuth連携をご利用ください。
					</DialogContentText>
				</DialogContent>
			</Dialog>
		</>
	),
	500,
);
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

class NoAuthError extends Error {}
