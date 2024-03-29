import * as github from "./github";

github.getUsersGithubData("tomo-x7").then((data) => {
	console.log(data);
});
