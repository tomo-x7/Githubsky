"use client";
import Link from "next/link";
import style from "./page.module.css";
import { useEffect, useState } from "react";
import { BskyAgent } from "@atproto/api";
class userdataclass {
	private DID?: string;
	private bsky_handle?: string;
	private bsky_password?: string;
	private github_name?: string;
	setdata(name: "DID" | "bsky_handle" | "bsky_password" | "github_name", value: string) {
		this[name] = value;
		return this[name];
	}
	getdata(name: "DID" | "bsky_handle" | "bsky_password" | "github_name") {
		return this[name];
	}
	getlist() {
		return {
			DID: this.DID,
			bsky_password: this.bsky_password,
			github_name: this.github_name,
			bsky_handle: this.bsky_handle,
		};
	}
}
const userdata = new userdataclass();
export const Steps = () => {
	/**
	 * アプリパスワード設定ページへのリンク
	 */
	const kotira = (
		<Link href="https://bsky.app/settings/app-passwords" target="__blank" rel="noopener noreferrer">
			こちら
		</Link>
	);
	const loading = () => {
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		document.getElementById("loading")!.style.display = "flex";
	};
	const loadingfin = () => {
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		document.getElementById("loading")!.style.display = "none";
	};
	const seterror = (error: unknown) => {
		try{
		switch (typeof error) {
			case "string":
				seterrorlog(error);
				break;
			case "number":
				seterrorlog(error.toString());
				break;
			case "bigint":
				seterrorlog(error.toString());
				break;
			case "boolean":
				seterrorlog(error ? "true" : "false");
				break;
			case "symbol":
				seterrorlog(error.toString());
				break;
			case "undefined":
				seterrorlog("不明なエラー");
				console.error(error);
				break;
			case "object":
				seterrorlog(JSON.stringify(error));
				break;
			case "function":
				seterrorlog("不明なエラー");
				console.error(error);
				break;
		}
	}catch(e){
		seterrorlog('不明なエラー')
		console.error(e)
	}
	};
	const [error, seterrorlog] = useState("");
	const bskysignup = async () => {
		loading();
		try {
			const bsky_handle = (document.getElementById("bsky_handle") as HTMLInputElement).value;
			const bsky_password = (document.getElementById("bsky_password") as HTMLInputElement).value;
			if (!(bsky_handle && bsky_password)) {
				loadingfin();
				seterror("空欄の項目があります");
				return;
			}
			const agent = new BskyAgent({
				service: "https://bsky.social",
			});
			try {
				if (
					!(
						bsky_handle === userdata.getdata("bsky_handle") &&
						bsky_password === userdata.getdata("bsky_password")
					)
				) {
					await agent.login({ identifier: bsky_handle, password: bsky_password });
					userdata.setdata("DID", (await agent.resolveHandle({ handle: bsky_handle })).data.did);
					userdata.setdata("bsky_password", bsky_password);
				}
			} catch (e) {
				loadingfin();
				seterror("認証に失敗しました。");
				return;
			}
			seterror("");
			setsteps(stepelems.step2(userdata));
		} catch (e) {
			loadingfin();
			seterror(e);
		}
	};
	const githubsignup = async () => {
		loading();
		const github_name = (document.getElementById("github_name") as HTMLInputElement).value;
		if (!github_name) return;
		const message = await fetch(`https://api.github.com/users/${github_name}`)
			.then((data) => data.json())
			.then((data) => {
				return data.message;
			});
		if (message) {
			loadingfin();
			seterror("ユーザーが見つかりません");
			return;
		}
		userdata.setdata("github_name", github_name);
		seterror("");
		setsteps(stepelems.step3(userdata));
	};
	const finish = async () => {
		loading();
		await fetch("/api/signup", {
			method: "POST",
			body: JSON.stringify(userdata.getlist()),
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then(() => {
				loadingfin();
			})
			.catch((e) => {
				seterror(e);
				loadingfin;
			});
	};
	const backtobsky = () => {
		seterror("");
		setsteps(stepelems.step1(userdata));
	};
	const backtogithub = () => {
		seterror("");
		setsteps(stepelems.step2(userdata));
	};
	const stepelems = {
		step1: (data: userdataclass) => {
			return (
				<>
					<h3>STEP1.Blueskyアカウントの連携</h3>
					<p>{kotira} からアプリパスワードを生成してください</p>
					<label className={style.label}>
						Blueskyのハンドル
						<input
							type="text"
							autoComplete="username"
							id="bsky_handle"
							placeholder="example.bsky.social"
							defaultValue={data.getdata("bsky_handle")}
							required
						/>
					</label>
					<label className={style.label}>
						Blueskyのアプリパスワード
						<input
							type="password"
							id="bsky_password"
							placeholder="aaaa-bbbb-cccc-dddd"
							defaultValue={data.getdata("bsky_password")}
							required
						/>
					</label>
					<div className={style.error}>{error}</div>
					<div className={style.button}>
						<input type="button" value="次へ" className={style.next} onClick={bskysignup} />
					</div>
				</>
			);
		},
		step2: (data: userdataclass) => {
			return (
				<>
					<h3>STEP2.Githubアカウントの連携</h3>
					<label className={style.label}>
						Githubのユーザーネーム
						<input
							type="text"
							autoComplete="username"
							id="github_name"
							defaultValue={data.getdata("github_name")}
							required
						/>
					</label>
					<div className={style.error}>{error}</div>
					<div className={style.button}>
						<input type="button" value="戻る" className={style.back} onClick={backtobsky} />
						<input type="button" value="次へ" className={style.next} onClick={githubsignup} />
					</div>
				</>
			);
		},
		step3: (data: userdataclass) => {
			return (
				<>
					<h3>STEP3.登録内容の確認</h3>
					<div>Bluesky:{data.getdata("bsky_handle")}</div>
					<div>Github:{data.getdata("github_name")}</div>
					<div className={style.error}>{error}</div>
					<div className={style.button}>
						<input type="button" value="戻る" className={style.back} onClick={backtogithub} />
						<input type="button" value="登録" className={style.next} onClick={finish} />
					</div>
				</>
			);
		},
	};
	const [steps, setsteps] = useState(stepelems.step1(userdata));
	return (
		<>
			<div className={style.steps}>{stepelems.step1(userdata)}</div>
			<div className={style.steps}>{stepelems.step2(userdata)}</div>
			<div className={style.steps}>{stepelems.step3(userdata)}</div>
		</>
	);
	//return <div className={style.steps}>{steps}</div>;
};

export const Loading = () => {
	return (
		<div className={style.loader_wrapper} style={{ display: "none" }} id="loading">
			<div className={style.loader}>Loading...</div>
		</div>
	);
};
