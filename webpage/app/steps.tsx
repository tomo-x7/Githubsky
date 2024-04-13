"use client";
import Link from "next/link";
import style from "./page.module.css";
import { useEffect, useState } from "react";
import { BskyAgent, RichText } from "@atproto/api";

let ogpimg: Uint8Array;
fetch("https://githubsky.vercel.app/ogp.png")
	.then((data) => data.arrayBuffer())
	.then((buff) => new Uint8Array(buff))
	.then((u8array) => {
		ogpimg = u8array;
	});

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
		try {
			const errorelem = document.getElementById("error");
			if (!errorelem) {
				window.alert(`深刻なエラーが発生した可能性があります\n${error}`);
				return;
			}
			console.log(typeof error);
			console.log(error);
			switch (typeof error) {
				case "string":
					errorelem.innerText = error;
					seterrorlog(error);
					break;
				case "number":
					errorelem.innerText = error.toString();
					seterrorlog(error.toString());
					break;
				case "bigint":
					errorelem.innerText = error.toString();
					seterrorlog(error.toString());
					break;
				case "boolean":
					errorelem.innerText = error ? "true" : "false";
					seterrorlog(error ? "true" : "false");
					break;
				case "symbol":
					errorelem.innerText = error.toString();
					seterrorlog(error.toString());
					break;
				case "undefined":
					errorelem.innerText = "不明なエラー";
					seterrorlog("不明なエラー");
					console.error(error);
					break;
				case "object":
					errorelem.innerText = JSON.stringify(error);
					seterrorlog(JSON.stringify(error));
					break;
				case "function":
					errorelem.innerText = "不明なエラー";
					seterrorlog("不明なエラー");
					console.error(error);
					break;
				default:
					errorelem.innerText = "不明なエラー";
					seterrorlog("不明なエラー");
					console.log(error);
					break;
			}
		} catch (e) {
			seterrorlog("不明なエラー");
			console.error(e);
		}
	};
	const [error, seterrorlog] = useState("");
	const agent = new BskyAgent({
		service: "https://bsky.social",
	});
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
			try {
				if (
					!(
						bsky_handle === userdata.getdata("bsky_handle") &&
						bsky_password === userdata.getdata("bsky_password")
					)
				) {
					await agent.login({ identifier: bsky_handle, password: bsky_password });
					userdata.setdata("bsky_handle", bsky_handle);
					userdata.setdata("DID", (await agent.resolveHandle({ handle: bsky_handle })).data.did);
					userdata.setdata("bsky_password", bsky_password);
				}
			} catch (e) {
				loadingfin();
				seterror("認証に失敗しました。");
				return;
			}
			seterror("");
			loadingfin();
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
		loadingfin();
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
			.then((data) => {
				if (data.ok) {
					loadingfin();
					setsteps(stepelems.step4);
				} else {
					loadingfin();
					seterror(data.statusText || `${data.status}のエラーが発生しました`);
				}
			})
			.catch((e) => {
				seterror(e);
				loadingfin;
			});
		try {
			const { data } = await agent.uploadBlob(ogpimg, {
				// 画像の形式を指定 ('image/jpeg' 等の MIME タイプ)
				encoding: "image/png",
			});
			const message = new RichText({
				text: "Githubskyに登録しました。これから毎日0時ごろに自動投稿を行います。\n#Githubsky",
			});
			message.detectFacets(agent);
			await agent.post({
				text: message.text,
				facets: message.facets,
				createdAt: new Date().toISOString(),
				langs: ["ja"],
				embed: {
					$type: "app.bsky.embed.external",
					external: {
						uri: "https://githubsky.vercel.app/",
						thumb: {
							$type: "blob",
							ref: {
								$link: data.blob.ref.toString(),
							},
							mimeType: "image/png",
							size: data.blob.size,
						},
						title: "Githubsky",
						description:
							"前日のGithubのコミット数と直近一週間のヒートマップを自動でBlueskyに投稿するサービスです。",
					},
				},
			});
		} catch (e) {
			seterror(e);
		}
	};
	const backtobsky = () => {
		seterror("");
		setsteps(stepelems.step1(userdata));
	};
	const backtogithub = () => {
		seterror("");
		setsteps(stepelems.step2(userdata));
	};
	const showpass = (ev: React.FormEvent<HTMLInputElement>) => {
		if (ev.currentTarget.checked) {
			(document.getElementById("bsky_password") as HTMLInputElement).type = "text";
		} else {
			(document.getElementById("bsky_password") as HTMLInputElement).type = "password";
		}
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
							name="bsky_handle"
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
							name="bsky_password"
							id="bsky_password"
							placeholder="aaaa-bbbb-cccc-dddd"
							defaultValue={data.getdata("bsky_password")}
							required
						/>
					</label>
					<label style={{ display: "block", width: "fit-content", userSelect: "none" }}>
						<input type="checkbox" onChange={showpass} id="showpass" />
						パスワードを表示
					</label>
					<div className={style.error} id="error">
						{error}
					</div>
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
							name="github_name"
							autoComplete="on"
							id="github_name"
							defaultValue={data.getdata("github_name")}
							required
						/>
					</label>
					<div className={style.error} id="error">
						{error}
					</div>
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
					<div>
						<span className={style.confirm_label}>Bluesky:</span>
						<span>{data.getdata("bsky_handle")}</span>
					</div>
					<div>
						<span className={style.confirm_label}>Github:</span>
						<span>{data.getdata("github_name")}</span>
					</div>
					<div>※登録時に登録完了ポストが投稿されます</div>
					<div className={style.error} id="error">
						{error}
					</div>
					<div className={style.button}>
						<input type="button" value="戻る" className={style.back} onClick={backtogithub} />
						<input type="button" value="登録" className={style.next} onClick={finish} />
					</div>
				</>
			);
		},
		step4: (
			<>
				<h3>STEP4.完了</h3>
				<p>
					ご利用いただきありがとうございます。
					<br />
					登録が完了しました。
					<br />
					登録完了ポストが投稿されていることを確認してください。
				</p>
			</>
		),
	};
	const [steps, setsteps] = useState(stepelems.step1(userdata));
	return <div className={style.steps}>{steps}</div>;
};

export const Loading = () => {
	return (
		<div className={style.loader_wrapper} style={{ display: "none" }} id="loading">
			<div className={style.loader}>Loading...</div>
		</div>
	);
};
