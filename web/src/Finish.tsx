import { CheckCircle } from "@mui/icons-material";
import { Typography } from "@mui/material";

export function Finish() {
	return (
		<>
			<Typography sx={{ mb: 3 }} variant="h5">
				<CheckCircle color="success" sx={{ pt: "2px", mb: "-2px", fontSize: 30 }} />
				連携が完了しました
			</Typography>
			<Typography sx={{ mb: 3 }}>明日の0時から自動投稿を行います。</Typography>
		</>
	);
}
