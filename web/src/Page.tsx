import { Box } from "@mui/material";
import { App } from "./App";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function Page(props: Parameters<typeof App>[0]) {
	return (
		<>
			<Header />
            <Box height="90%"><App {...props} /></Box>
			
            <Footer />
		</>
	);
}
