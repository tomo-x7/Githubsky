import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import { About } from "./About";

export function Header() {
	return (
		<>
			<AppBar position="fixed">
				<Toolbar>
					<Typography variant="h4" component="div" fontWeight={500}>
						Githubsky
					</Typography>
					<Button onClick={() => About.call()} sx={{ color: "white", display: "block", fontSize: 18, ml: 3 }}>
						about
					</Button>
				</Toolbar>
				<About.Root />
			</AppBar>
		</>
	);
}
