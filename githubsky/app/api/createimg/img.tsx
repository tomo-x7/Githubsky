import { requestToBodyStream } from "next/dist/server/body-streams";
import type React from "react";
import type { ReactElement } from "react";

type week = {
	0: number;
	1: number;
	2: number;
	3: number;
	4: number;
	5: number;
	6: number;
};
let graphmaxscale=20;
export type params = { count: number; lastweek: week };
export const elem = (params: params) => {
	const lastweekarray=[
		params.lastweek[0],
		params.lastweek[1],
		params.lastweek[2],
		params.lastweek[3],
		params.lastweek[4],
		params.lastweek[5],
		params.lastweek[6],
	]
	const lastweekmax=Math.max(...lastweekarray)
	graphmaxscale=Math.max(20,Math.ceil(lastweekmax/10)*10)
	return (
		<>
			<div style={style.wrapper}>
				<div style={style.countwrapper}>
					昨日のコミット数:<div style={style.count}>{params.count}</div>
				</div>
				<div style={{display:"flex",flexDirection:"row"}}>
					<div style={style.graphscale}>
						<div style={style.scale}>0</div>
						<div style={style.scale}>{graphmaxscale/2}</div>
						<div style={style.scale}>{graphmaxscale}</div>
					</div>
					<div style={style.graphwrapper}>
						{graphelem(0, lastweekarray[0])}
						{graphelem(1, lastweekarray[1])}
						{graphelem(2, lastweekarray[2])}
						{graphelem(3, lastweekarray[3])}
						{graphelem(4, lastweekarray[4])}
						{graphelem(5, lastweekarray[5])}
						{graphelem(6, lastweekarray[6])}
						<div style={style.border1} />
						<div style={style.border2} />
						<div style={style.border3} />
					</div>
				</div>
			</div>
		</>
	);
};
const style: { [key: string]: React.CSSProperties } = {
	wrapper: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		height: "100vh",
	},
	graphwrapper: {
		display: "flex",
		justifyContent: "space-between",
		height: "430px",
		width: "92vw",
		alignItems: "flex-end",
		overflow: "hidden",
		position: "relative",
		paddingLeft: "2vw",
		borderTop: "1px solid black",
	},
	graphelemwrapper: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
	},
	graphday: {
		display: "flex",
		fontSize: "21px",
	},
	countwrapper: {
		display: "flex",
		fontSize: "30px",
		height: "40px",
	},
	count: {
		display: "flex",
		fontSize: "30px",
		color: "red",
	},
	border1: {
		display: "flex",
		position: "absolute",
		width: "98vw",
		bottom: "30px",
		borderTop: "1px solid black",
	},
	border2: {
		display: "flex",
		position: "absolute",
		width: "98vw",
		bottom: "230px",
		borderTop: "1px solid black",
	},
	border3: {
		display: "flex",
		position: "absolute",
		height: "100%",
		bottom: "30px",
		left: "0px",
		borderLeft: "1px solid black",
	},
	graphscale: {
		display: "flex",
		marginTop:"-8px",
		marginBottom:"22px",
		marginLeft:"3vw",
		marginRight:"5px",
		flexDirection:"column-reverse",
		justifyContent:"space-between",
		alignItems:"flex-end"
	},
	scale: {
		display: "flex",
		textAlign:"right",
	},
};
const graphelem = (
	day: number /*曜日、0が日曜日*/,
	count: number,
): ReactElement => {
	const today = new Date();
	today.setHours(today.getHours() - 9);

	const days = ["日", "月", "火", "水", "木", "金", "土"];
	const localstyle: React.CSSProperties = {
		display: "flex",
		backgroundColor: "green",
		width: "40px",
		height: `${count * (400/graphmaxscale)}px`,
		borderStyle: "solid",
		borderWidth: "1px",
		borderColor: "black",
	};
	if (day === today.getDay() - 1) {
		localstyle.backgroundColor = "red";
	}
	return (
		<div style={style.graphelemwrapper}>
			<div style={localstyle} />
			<div style={style.graphday}>{days[day]}</div>
		</div>
	);
};
