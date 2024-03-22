type apires = {
	id: string;
	type: string;
	created_at: string;
	payload: { commits: Array<unknown> };
	[key: string]: string | number | object;
};
export type week = {
	0: number;
	1: number;
	2: number;
	3: number;
	4: number;
	5: number;
	6: number;
	[key: number]: number;
};
export const getUsersGithubData = async (username: string): Promise<{count:number,lastweek:week}> => {
	const alldata: Array<apires> = [];
	const lastgetday = new Date();
	lastgetday.setDate(new Date().getDate() - 7);
	for (let i = 1; i < 100; i++) {
		const data: Array<apires> = await fetch(
			`https://api.github.com/users/${username}/events?page=${i}`,
		).then((data) => data.json());
		alldata.push(...data);
		if (!(data[0] && lastgetday < new Date(data[data.length - 1].created_at))) {
			break;
		}
	}

	const lastweek: week = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
	let commitcount = 0;
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	const pushdata = alldata
		.map((data) => {
			const day = new Date(data.created_at);
			if (data.type === "PushEvent" && day > lastgetday) {
				const jst = day;
				jst.setHours(day.getHours() + 9);
				lastweek[jst.getDay()] += data.payload.commits.length;
				if (day > yesterday) {
					commitcount += data.payload.commits.length;
				}
				return data;
			}
		})
		.filter((item) => item !== undefined);
	return {count:commitcount,lastweek:lastweek};
};
