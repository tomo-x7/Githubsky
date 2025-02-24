import { Snackbar } from "@mui/material";
import { createCallable } from "react-call";

export const NotifyElem = createCallable<{ message: string }>(
	({ call, message }) => (
		<>
			<Snackbar autoHideDuration={5000} message={message} onClose={() => call.end()} open={!call.ended} />
		</>
	),
	1000,
);

export const notify = (message: string) => NotifyElem.call({ message });
