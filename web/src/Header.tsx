import { AppBar, Avatar, Box, Button, Toolbar, Typography } from "@mui/material";
import { About } from "./About";

export function Header({bskyName,bskyAvatar}:{bskyName:string|undefined,bskyAvatar:string|undefined}) {
	return (
		<>
			<AppBar position="fixed">
				<Toolbar>
					<Typography variant="h4" component="div" fontWeight={500}>
						Githubsky
					</Typography>
					<Button onClick={() => About.call()} sx={{ color: "white", display: "block", fontSize: 18, ml: 3, }}>
						about
					</Button>
					<Box sx={{flexGrow:1}} />
					<Avatar src={bskyAvatar} />
				</Toolbar>
				<About.Root />
			</AppBar>
		</>
	);
}
