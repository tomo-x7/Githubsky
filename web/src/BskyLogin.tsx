import { AlternateEmail } from "@mui/icons-material";
import { Box, Button, InputAdornment, TextField, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { notify } from "./Notify";
import type { client } from "./main";
import { handleEnter } from "./util";

const regex = /^(?!\-)[\-0-9A-Za-z]{1,63}(?<!\-)(?:\.(?!\-)[\-0-9A-Za-z]{1,63}(?<!\-))+$|^did:plc:[0-9a-z]{24}$/;
export function BskyLogin({ client }: { client: client }) {
	const [handle, setHandle] = useState<string>("");
	const [sending, setSending] = useState(false);
	const isHandleValid = useMemo(() => handle !== "" && regex.test(handle), [handle]);
	const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => setHandle(e.target.value);
	const handleLogin = async () => {
		setSending(true);
		try {
			const url = await client.login.$post({ json: { handle } }).then((r) => (r.ok ? r.text() : null));
			if (url == null) throw new Error();
			location.href = url;
		} catch (e) {
			setSending(false);
			notify("エラーが発生しました");
		}
	};
	return (
		<>
			<Typography variant="h4">Blueskyでログインする</Typography>
			<TextField
				error={!isHandleValid}
				helperText={isHandleValid ? undefined : handle === "" ? "required" : "invalid value"}
				label="Bluesky handle"
				onInput={handleInput}
				onKeyDown={handleEnter(handleLogin)}
				placeholder="example.bsky.social"
				slotProps={{
					input: {
						startAdornment: (
							<InputAdornment position="start">
								<AlternateEmail />
							</InputAdornment>
						),
					},
				}}
				variant="standard"
				sx={{ my: 4 }}
				autoComplete="section-atproto username"
			/>
			<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
				<Button disabled={!isHandleValid} onClick={handleLogin} variant="contained" loading={sending}>
					Login
				</Button>
			</Box>
		</>
	);
}
