import { Hono } from "hono";
import { hc } from "hono/client";

const app = new Hono().basePath("api/");
const app2=new Hono()

const app2schema=app2.get("/*",(c)=>c.text("app2"))
const Schema=app.get("/", (c) => {
	return c.text("Hello Hono!");
}).route("/app2",app2)

export const onRequest: PagesFunction = (c) => app.fetch(c.request);

const client=hc<typeof app2schema>("")
