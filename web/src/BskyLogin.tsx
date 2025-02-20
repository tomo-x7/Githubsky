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
			<Box>
				<Paper sx={{ width: "fit-content", margin: "auto", padding: "1rem",height:"200px",display:"flex",flexDirection:"column",justifyContent:"space-between" }}>
					<TextField
						error={!isHandleValid}
						helperText={isHandleValid ? undefined : handle === "" ? "required" : "invalid value"}
						variant="standard"
						label="your Bluesky handle"
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
					<Box sx={{display:"flex",justifyContent:"flex-end"}}>
						<Button disabled={!isHandleValid}>Login</Button>
					</Box>
				</Paper>
			</Box>
		</>
	);
}
