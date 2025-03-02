import { Container, Paper } from "@mui/material";
import { App } from "./App";
import { Header } from "./Header";
import { NotifyElem } from "./Notify";
import { DepInfo } from "./util";

export function Page(props: Parameters<typeof App>[0]) {
	return (
		<>
			<Header />
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
					<App {...props} />
				</Paper>
			</Container>
			<NotifyElem.Root />
			<DepInfo.Root />
		</>
	);
}
