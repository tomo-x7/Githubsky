import { Box, Paper } from "@mui/material";
import { App } from "./App";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function Page(props: Parameters<typeof App>[0]) {
	return (
		<>
			<Header />
			<Box height="90%">
				<Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
					<Paper
						sx={{
							width: "400px",
							maxWidth: "80vw",
							padding: "1rem",
							height: "200px",
							display: "flex",
							flexDirection: "column",
							justifyContent: "space-between",
						}}
					>
						<App {...props} />
					</Paper>
				</Box>
			</Box>

			<Footer />
		</>
	);
}
