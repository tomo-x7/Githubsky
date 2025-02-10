export interface Env {
	githubsky_worker: Fetcher;
}

export const onRequest: PagesFunction<Env> = (c) => {
	return c.env.githubsky_worker.fetch(c.request);
};
