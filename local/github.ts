type apires = {
	type: string;
	created_at: string;
	payload: { commits: Array<unknown> };
};
type starapires = {
	type: "WatchEvent" | string;
	created_at: string;
	repo: {
		name: string;
	};
	payload: { commits: Array<unknown> };
};
export type week = [number, number, number, number, number, number, number];
const date = (day = 0) => {
	const date = new Date();
	date.setDate(date.getDate() + day);
	date.setHours(0, 0, 0, 0);
	return date;
};

export const getUsersGithubData = async ({
	github_name,
	Github_token,
}: { github_name: string; Github_token?: string | null }) => {
	const lastweekdata: Array<apires> = [];
	const stardata: Array<starapires> = [];
	const lastgetday = date(-7);
	const fetchoption: RequestInit = Github_token ? { headers: [["Authorization", `Bearer ${Github_token}`]] } : {};
	//データを取得
	for (let i = 1; i < 100; i++) {
		const data = await fetch(`https://api.github.com/users/${github_name}/events?page=${i}`, fetchoption).then(
			(data) => data.json() as Promise<apires[]>,
		);
		lastweekdata.push(...data);
		if (!(data[0] && lastgetday < new Date(data[data.length - 1].created_at))) {
			break;
		}
	}
	for (let i = 1; i < 100; i++) {
		const data = await fetch(
			`https://api.github.com/users/${github_name}/received_events?page=${i}`,
			fetchoption,
		).then((data) => data.json() as Promise<starapires[]>);
		stardata.push(...data);
		if (!(data[0] && lastgetday < new Date(data[data.length - 1].created_at))) {
			break;
		}
	}

	const lastweek: week = [0, 0, 0, 0, 0, 0, 0];
	let commitcount = 0;
	let star = 0;
	const yesterday = date(-1);
	const today = date(0);
	for (const data of lastweekdata) {
		const day = new Date(data.created_at);
		console.log(`${day.toLocaleString()}:${data.payload.commits?.length}`);
		if (data.type === "PushEvent" && lastgetday < day && day < today) {
			lastweek[day.getDay()] += data.payload.commits.length;
			if (yesterday < day) {
				commitcount += data.payload.commits.length;
			}
		}
	}
	const reponame = new RegExp(`^${github_name}/`, "i");
	for (const data of stardata) {
		const day = new Date(data.created_at);
		if (data.type === "WatchEvent" && day > lastgetday && day < today) {
			if (reponame.test(data.repo.name)) {
				//自分のリポジトリか判断
				star += 1;
			}
		}
	}
	return { count: commitcount, lastweek: lastweek, star: star };
};
