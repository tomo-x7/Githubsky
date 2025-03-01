import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { createCallable } from "react-call";

export const About = createCallable(
	({ call }) => (
		<>
			<Dialog open={!call.ended} onClose={() => call.end()}>
				<DialogTitle>About</DialogTitle>
				<DialogContent>
					Githubskyは、直近のGithubでのコミット数をBlueskyに自動投稿するサービスです。
					毎日0時ごろに自動投稿します。
					<br />
					developed by{" "}
					<a
						href="https://bsky.app/profile/did:plc:qcwvyds5tixmcwkwrg3hxgxd/"
						target="_blank"
						rel="noopener noreferrer"
					>
						@tomo-x.win
					</a>
				</DialogContent>
			</Dialog>
		</>
	),
	500,
);
