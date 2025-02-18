import { createClient } from "@githubsky/worker";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";

const client = createClient();
export type client = typeof client;
// biome-ignore lint/style/noNonNullAssertion: <explanation>
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App client={client} />
	</StrictMode>,
);
