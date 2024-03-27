"use client";
import Link from "next/link";
import style from "./page.module.css";
import { useState } from "react";
import { BskyAgent } from "@atproto/api";

export const Steps = () => {
	/**
	 * アプリパスワード設定ページへのリンク
	 */
	const kotira = (
		<Link href="https://bsky.app/settings/app-passwords" target="__blank" rel="noopener noreferrer">
			こちら
		</Link>
	);
	class userdataclass {
		private DID?: string;
		private bsky_handle?: string;
		private bsky_password?: string;
		private github_name?: string;
		setdata(name: "DID" | "bsky_handle" | "bsky_password" | "github_name", value: string) {
			this[name] = value;
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
	const bskysignup = async () => {
		const bsky_handle = (document.getElementById("bsky_handle") as HTMLInputElement).value;
		const bsky_password = (document.getElementById("bsky_password") as HTMLInputElement).value;
		if (!(bsky_handle && bsky_password)) {
			window.alert("空欄の項目があります");
			return;
		}
		const agent = new BskyAgent({
			service: "https://bsky.social",
		});
		try {
			await agent.login({ identifier: bsky_handle, password: bsky_password });
		} catch (e) {
			window.alert("認証に失敗しました。");
			return;
		}
		userdata.setdata("bsky_handle", bsky_handle);
		userdata.setdata("DID", (await agent.resolveHandle({ handle: bsky_handle })).data.did);
		userdata.setdata("bsky_password", bsky_password);
		window.alert(`連携が完了しました\n${JSON.stringify(userdata)}`);
		setsteps(stepelems.step2(userdata));
	};
	const githubsignup = async () => {
		const github_name = (document.getElementById("github_name") as HTMLInputElement).value;
		if (!github_name) return;
		const message = await fetch(`https://api.github.com/users/${github_name}`)
			.then((data) => data.json())
			.then((data) => {
				return data.message;
			});
		if (message) {
			window.alert("ユーザーが見つかりません");
			return;
		}
		userdata.setdata("github_name", github_name);
		window.alert(`連携が完了しました\n${JSON.stringify(userdata)}`);
		setsteps(stepelems.step3(userdata));
	};
	const finish = async () => {
		fetch("/api/signup", {
			method: "POST",
			body: JSON.stringify(userdata.getlist()),
			headers:{
				'Content-Type': 'application/json'
			}
		});
	};
	const backtobsky = () => {
		setsteps(stepelems.step1(userdata));
	};
	const backtogithub = () => {
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
							id="bsky_handle"
							placeholder="example.bsky.social"
							defaultValue={data.getdata("bsky_handle")}
							required
						/>
					</label>
					<label className={style.label}>
						Blueskyのアプリパスワード
						<input
							type="text"
							id="bsky_password"
							placeholder="aaaa-bbbb-cccc-dddd"
							defaultValue={data.getdata("bsky_password")}
							required
						/>
					</label>
					<input type="button" value="次へ" onClick={bskysignup} />
				</>
			);
		},
		step2: (data: userdataclass) => {
			return (
				<>
					<h3>STEP2.Githubアカウントの連携</h3>
					<label className={style.label}>
						Githubのユーザーネーム
						<input type="text" id="github_name" defaultValue={data.getdata("github_name")} required />
					</label>
					<input type="button" value="戻る" onClick={backtobsky} />
					<input type="button" value="次へ" onClick={githubsignup} />
				</>
			);
		},
		step3: (data: userdataclass) => {
			return (
				<>
					<h3>STEP3.登録内容の確認</h3>
					<div>Bluesky:{data.getdata("bsky_handle")}</div>
					<div>Github:{data.getdata("github_name")}</div>
					<input type="button" value="戻る" onClick={backtogithub} />
					<input type="button" value="登録" onClick={finish} />
				</>
			);
		},
	};
	const [steps, setsteps] = useState(stepelems.step1(userdata));
	return <div className={style.steps}>{steps}</div>;
};
