import { Box, Button, InputAdornment, inputBaseClasses, Paper, TextField } from "@mui/material";
import { client } from "./main";
import { useMemo, useState } from "react";
import { AlternateEmail } from "@mui/icons-material";

const regex = /^(?!\-)[\-0-9A-Za-z]{1,63}(?<!\-)(?:\.(?!\-)[\-0-9A-Za-z]{1,63}(?<!\-))+$|^did:plc:[0-9a-z]{24}$/;
export function BskyLogin({ client }: { client: client }) {
	const [handle, setHandle] = useState<string>("");
	const isHandleValid = useMemo(() => handle !== "" && regex.test(handle), [handle]);
	const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => setHandle(e.target.value);
	return (
		<>
			<TextField
				error={!isHandleValid}
				helperText={isHandleValid ? undefined : handle === "" ? "required" : "invalid value"}
				variant="standard"
				label="Bluesky handle"
				placeholder="example.bsky.social"
				onInput={handleInput}
				slotProps={{
					input: {
						startAdornment: (
							<InputAdornment position="start">
								<AlternateEmail />
							</InputAdornment>
						),
					},
				}}
			/>
			<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
				<Button variant="contained" href={`/api/login?handle=${handle}`} disabled={!isHandleValid}>
					Login
				</Button>
			</Box>
		</>
	);
}
