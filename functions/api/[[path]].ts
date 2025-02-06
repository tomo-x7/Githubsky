import { Hono } from "hono";

const app = new Hono().basePath("api/");
const app2 = new Hono();

const Schema = app
	.get("/", (c) => {
		return c.text("Hello Hono!");
	})
	.route("/app2", app2);

export const onRequest: PagesFunction = (c) => app.fetch(c.request);
export type ServerType = typeof Schema;
