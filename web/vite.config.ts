import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: { allowedHosts: true, proxy: { "/api": { target: "http://localhost:8787/" } } },
});
