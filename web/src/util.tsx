import { Dialog, DialogTitle, DialogContent, DialogContentText } from "@mui/material";
import { createCallable } from "react-call";

export class NoAuthError extends Error {}

export const DepInfo = createCallable(
	({ call }) => (
		<>
			<Dialog
				aria-describedby="alert-dialog-description"
				aria-labelledby="alert-dialog-title"
				onClose={() => call.end()}
				open={!call.ended}
			>
				<DialogTitle id="alert-dialog-title">名前での連携は非推奨です</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						OAuth連携をすることで、プライベートリポジトリへのコミット数も取得することができます。
						コミット数とスター数以外の情報は公開されません。ぜひOAuth連携をご利用ください。
					</DialogContentText>
				</DialogContent>
			</Dialog>
		</>
	),
	500,
);