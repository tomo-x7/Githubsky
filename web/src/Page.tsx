import { Container, Paper } from "@mui/material";
import { useState } from "react";
import { App } from "./App";
import { Header } from "./Header";
import { NotifyElem } from "./Notify";
import type { client } from "./main";
import { DepInfo } from "./util";

export function Page({ client }: { client: client }) {
	const [profile, setProfile] = useState<{ bskyName: string | undefined; bskyAvatar: string | undefined }>({
		bskyName: undefined,
		bskyAvatar: undefined,
	});
	return (
		<>
			<Header {...profile} />
			<Container fixed sx={{ position: "fixed", inset: 0, alignContent: "center", width: "fit-content" }}>
				<Paper
					sx={{
						width: "450px",
						maxWidth: "80vw",
						height: "fit-content",
						padding: "1rem",
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-between",
						px: 5,
						py: 3,
					}}
				>
					<App {...{ client, setProfile }} />
				</Paper>
			</Container>
			<NotifyElem.Root />
			<DepInfo.Root />
		</>
	);
}
