import { createCanvas } from "canvas";
import { Chart } from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import type { GithubData } from "./github";

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

Chart.register(ChartDataLabels);
Chart.defaults.scales.linear.display = false;
Chart.defaults.plugins.legend.display = false;

export function createImg(data: GithubData): Buffer {
	const lastweekarray: Array<number> = [
		data.lastweek[0],
		data.lastweek[1],
		data.lastweek[2],
		data.lastweek[3],
		data.lastweek[4],
		data.lastweek[5],
		data.lastweek[6],
	];
	const image = { width: 1074, height: 564 };
	const graphheight = 400;

	const graphcanvas = createCanvas(image.width - 10, graphheight);
	const graphcontext = graphcanvas.getContext("2d");
	const maincanvas = createCanvas(image.width, image.height);
	const mctx = maincanvas.getContext("2d");

	const grad = mctx.createLinearGradient(0, 100, 0, 320);
	grad.addColorStop(1, "#070");
	grad.addColorStop(0, "#6d6");
	const graphBackgroundColor = Array(7)
		.fill("")
		.map((v, i) => {
			if (i === yesterday.getDay()) return grad;
			if (i > yesterday.getDay()) return "#71EB71";
			return "#2DB52D";
		});

	new Chart(graphcontext, {
		type: "bar",
		data: {
			labels: ["日", "月", "火", "水", "木", "金", "土"],
			datasets: [
				{
					data: lastweekarray,
					backgroundColor: graphBackgroundColor,
					datalabels: {
						color: "rgba(200,60,60,1)",
						font: (c) =>
							c.dataIndex === yesterday.getDay()
								? { size: 45, weight: "bolder" }
								: { size: 25, weight: "bold" },
						anchor: "start",
						align: "top",
						padding: 0,
					},
				},
			],
		},
		options: {
			scales: {
				myscale: {
					axis: "y",
					display: true,
					ticks: {
						stepSize: 5,
						color: "#0008",
						font: { size: 15 },
					},
					grace: "15%",
					suggestedMax: 5,
					grid: { color: "#0008", tickColor: "#0008", display: false },
				},
				x: {
					axis: "x",
					ticks: { color: "#000" },
					grid: { color: "#0008", drawTicks: false, display: false },
				},
			},
		},
	});

	mctx.fillStyle ="white";
	mctx.fillRect(0, 0, image.width, image.height);
	mctx.fillStyle = "black";
	mctx.font = "25px";
	mctx.textBaseline = "top";
	const yestMet = mctx.measureText("昨日のコミット数:");
	const weekMet = mctx.measureText("直近一週間のコミット数:");
	mctx.fillText("昨日のコミット数:", 20, 10);
	mctx.fillText("直近一週間のコミット数:", 20, 55);
	mctx.fillStyle = "red";
	mctx.fillText(data.count.toString(), 20 + yestMet.width + 10, 11);
	mctx.fillText(data.lastweek.reduce((p, c) => p + c, 0).toString(), 20 + weekMet.width + 10, 56);
	if (data.star > 0) {
		mctx.fillStyle = "black";
		const startMet = mctx.measureText("直近一週間で獲得したスター:");
		mctx.fillText("直近一週間で獲得したスター:", 20 + image.width / 2, 10);
		mctx.fillStyle = "red";
		mctx.fillText(data.star.toString(), image.width / 2 + 20 + startMet.width + 10, 11);
	}

	mctx.drawImage(graphcanvas, 0, image.height - graphheight);
	return maincanvas.toBuffer("image/png");
}
