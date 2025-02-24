import { Box, Paper } from "@mui/material";
import { App } from "./App";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { NotifyElem } from "./Notify";

export function Page(props: Parameters<typeof App>[0]) {
	return (
		<>
			<Header />
			<Box height="90%">
				<Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
					<Paper
						sx={{
							width: "450px",
							maxWidth: "80vw",
							height: "300px",
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
				</Box>
			</Box>
			<Footer />
			<NotifyElem.Root />
		</>
	);
}
