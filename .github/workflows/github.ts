import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.locale("ja");
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Tokyo");


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
	const lastgetday = dayjs();
	lastgetday.set('date',lastgetday.get('date')-7)
	for (let i = 1; i < 100; i++) {
		const data: Array<apires> = await fetch(
			`https://api.github.com/users/${username}/events?page=${i}`,
		).then((data) => data.json());
		alldata.push(...data);
		if (!(data[0] && lastgetday < dayjs(data[data.length - 1].created_at))) {
			break;
		}
	}

	const lastweek: week = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
	let commitcount = 0;
	const yesterday = dayjs();
	yesterday.set('date',yesterday.get('date')-1)
	const pushdata = alldata
		.map((data) => {
			const day =dayjs(data.created_at);
			if (data.type === "PushEvent" && day > lastgetday) {
				lastweek[day.get('day')] += data.payload.commits.length;
				if (day > yesterday) {
					commitcount += data.payload.commits.length;
				}
				return data;
			}
		})
		.filter((item) => item !== undefined);
	return {count:commitcount,lastweek:lastweek};
};
