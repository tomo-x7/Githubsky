"use client";

import { useRef, useState } from "react";
import style from "./page.module.css";
import Link from "next/link";
import { BskyAgent, RichText } from "@atproto/api";

type props = {
	href: string | URL;
	children?: React.ReactNode | string | undefined;
};
const Mylink = ({ href, children }: props) => {
	return (
		<Link href={href} target="__blank" rel="noopener noreferrer">
			{children}
		</Link>
	);
};
const kotira = <Mylink href="https://bsky.app/settings/app-passwords">こちら</Mylink>;
type userdata = {
	DID: string;
	bsky_handle: string;
	bsky_password: string;
	github_name: string;
	Github_token?: string;
	bsky_pds?: string;
};
type elemref<T = HTMLInputElement> = React.MutableRefObject<T | null>;
type refs = {
	bsky_pds_elem: elemref;
	bsky_handle_elem: elemref;
	bsky_password_elem: elemref;
	github_name_elem: elemref;
	github_token_elem: elemref;
};
type params = {
	next: () => void;
	back: () => void;
	refs: refs;
	userdata: React.MutableRefObject<userdata | undefined>;
	agent: React.MutableRefObject<BskyAgent>;
	loading: () => void;
	loadingfin: () => void;
};

export default function Client({ ogpimg }: { ogpimg: Uint8Array }) {
	const refs: refs = {
		bsky_pds_elem: useRef<HTMLInputElement>(null),
		bsky_handle_elem: useRef<HTMLInputElement>(null),
		bsky_password_elem: useRef<HTMLInputElement>(null),
		github_name_elem: useRef<HTMLInputElement>(null),
		github_token_elem: useRef<HTMLInputElement>(null),
	};
	const [step, setstep] = useState<1 | 2 | 3>(1);

	const userdata = useRef<userdata>();
	const agent = new BskyAgent({
		service: "https://bsky.social",
	});
	const agentref = useRef(agent);

	const loading = () => {
		document.body.classList.add(style.loading);
	};
	const loadingfin = () => {
		document.body.classList.remove(style.loading);
	};

	if (step === 1) {
		return (
			<>
				<Step1
					agent={agentref}
					next={() => setstep(2)}
					refs={refs}
					userdata={userdata}
					loading={loading}
					loadingfin={loadingfin}
				/>
			</>
		);
	}
	if (step === 2) {
		return (
			<>
				<Step2
					next={() => setstep(3)}
					back={() => setstep(1)}
					userdata={userdata}
					refs={refs}
					agent={agentref}
					ogpimg={ogpimg}
					loading={loading}
					loadingfin={loadingfin}
				/>
			</>
		);
	}
	if (step === 3) {
		return (
			<>
				<Step3 />
			</>
		);
	}
}

function Step1({ next, userdata, refs, agent, loading, loadingfin }: Omit<params, "back">) {
	const [passwordelem_type, setpasswordelem_type] = useState<"text" | "password">("password");
	const [error, seterror] = useState("");
	const login = async () => {
		try {
			seterror("");
			loading();
			const bsky_handle = refs.bsky_handle_elem.current?.value;
			const bsky_password = refs.bsky_password_elem.current?.value;
			const github_name = refs.github_name_elem.current?.value;
			const Github_token = refs.github_token_elem.current?.value;
			const bsky_pds = refs.bsky_pds_elem.current?.value;
			if (!bsky_handle || !bsky_password || !github_name) {
				console.log(`${refs.bsky_handle_elem.current}+${bsky_password}+${github_name}`);
				seterror("空欄の項目があります");
				loadingfin;
				return;
			}
			if (bsky_pds) {
				if (!URL.canParse(bsky_pds)) {
					seterror("PDSのURLが間違っています");
					loadingfin();
					return;
				}
				agent.current = new BskyAgent({ service: bsky_pds });
			}
			//bskyのログインチェック
			try {
				await agent.current.login({ identifier: bsky_handle, password: bsky_password });
			} catch {
				seterror("認証に失敗しました。");
				throw new Error();
			}
			const DID = (await agent.current.resolveHandle({ handle: bsky_handle })).data.did;
			let isnotfound = false;
			if (!Github_token) {
				//githubのログインチェック(トークンなし)
				await fetch(`https://api.github.com/users/${github_name}`).then((res) => {
					if (!res.ok) {
						loadingfin();
						if (res.status === 404) {
							seterror("ユーザーが見つかりません");
						} else {
							seterror("エラーが発生しました");
						}
						isnotfound = true;
						return;
					}
				});
			} else {
				//githubのログインチェック(トークンあり)
				console.log("has token")
				await fetch(`https://api.github.com/users/${github_name}`, {
					cache: "no-store",
					headers: { Authorization: `Bearer ${Github_token}` },
				}).then((res) => {
					console.log(res.status)
					if (!res.ok) {
						loadingfin();
						if (res.status === 404) {
							seterror("ユーザーが見つかりません");
						} else if (res.status === 401) {
							seterror("トークンが間違っています");
						} else {
							seterror("エラーが発生しました");
						}
						isnotfound = true;
						return;
					}
					if (res.ok) {
						const scopes = res.headers.get("x-oauth-scopes")?.replaceAll(/\s/g,"")?.split(",");
						console.log(scopes)
						if (!scopes?.includes("repo")) {
							seterror("トークンのスコープが間違っています");
							isnotfound = true;
							return;
						}
					}
				});
			}
			if (isnotfound) return;

			//データ保存
			userdata.current = { DID, bsky_handle, bsky_password, github_name, Github_token, bsky_pds };
			//読み込み画面終了して次へ
			loadingfin();
			next();
		} catch (e) {
			console.log(e);
			seterror("エラーが発生しました");
			return;
		} finally {
			loadingfin();
		}
	};
	return (
		<>
			<h3>STEP1-1.Blueskyアカウントの連携</h3>
			<p>{kotira} からアプリパスワードを生成してください</p>
			<label className={style.label}>
				BlueskyのPDS(オプション)
				<input
					type="text"
					name="bsky_PDS"
					id="bsky_PDS"
					placeholder="https://bsky.social"
					ref={refs.bsky_pds_elem}
					defaultValue={userdata.current?.bsky_pds}
				/>
			</label>
			<label className={style.label}>
				Blueskyのハンドル
				<input
					type="text"
					name="bsky_handle"
					autoComplete="username"
					id="bsky_handle"
					placeholder="example.bsky.social"
					ref={refs.bsky_handle_elem}
					defaultValue={userdata.current?.bsky_handle}
				/>
			</label>
			<label className={style.label}>
				Blueskyのアプリパスワード
				<input
					type={passwordelem_type}
					name="bsky_password"
					id="bsky_password"
					placeholder="aaaa-bbbb-cccc-dddd"
					ref={refs.bsky_password_elem}
					defaultValue={userdata.current?.bsky_password}
				/>
			</label>
			<label style={{ display: "block", width: "fit-content", userSelect: "none" }}>
				<input
					type="checkbox"
					onChange={(ev) => {
						if (ev.currentTarget.checked) {
							setpasswordelem_type("text");
						} else {
							setpasswordelem_type("password");
						}
					}}
					id="showpass"
				/>
				パスワードを表示
			</label>
			<h3>STEP1-2.Githubアカウントの連携</h3>
			<label className={style.label}>
				Githubのユーザーネーム
				<input
					type="text"
					name="github_name"
					autoComplete="on"
					id="github_name"
					required
					ref={refs.github_name_elem}
					defaultValue={userdata.current?.github_name}
				/>
			</label>
			<label className={style.label}>
				GithubのPersonal access token(オプション)
				<input
					type="text"
					name="github_token"
					autoComplete="on"
					id="github_token"
					ref={refs.github_token_elem}
					defaultValue={userdata.current?.Github_token}
				/>
			</label>
			<div>
				tokenを設定することで、プライベートリポジトリのコミット数も取得することが可能になります。
				<a href="https://github.com/settings/tokens/" target="_blank" rel="noopener noreferrer">
					https://github.com/settings/tokens/
				</a>
				から、classicの方を選び、Expirationは"no Exporatotion"、Select scopesは"repo"にチェックを入れて生成してください
			</div>
			<div className={style.error} id="error">
				{error}
			</div>
			<div className={style.button}>
				<input type="button" value="次へ" className={style.next} onClick={login} />
			</div>
		</>
	);
}
function Step2({ next, back, userdata, refs, agent, ogpimg, loading, loadingfin }: params & { ogpimg: Uint8Array }) {
	const [error, seterror] = useState(agent.current.service.toString());

	const send = async () => {
		try {
			loading();
			//データを登録
			const res = await fetch("/api/signup", {
				method: "POST",
				body: JSON.stringify(userdata.current),
				headers: {
					"Content-Type": "application/json",
				},
			}).then((data) => {
				if (!data.ok) {
					loadingfin();
					seterror(data.statusText || `${data.status}のエラーが発生しました`);
					return "error";
				}
			});
			if (res === "error") {
				loadingfin();
				return;
			}
			try {
				const { data } = await agent.current.uploadBlob(ogpimg, {
					// 画像の形式を指定 ('image/jpeg' 等の MIME タイプ)
					encoding: "image/png",
				});
				const message = new RichText({
					text: "Githubskyに登録しました。これから毎日0時ごろに自動投稿を行います。\n#Githubsky",
				});
				message.detectFacets(agent.current);
				await agent.current.post({
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
				console.log(e);
				seterror("登録完了ポストの投稿時にエラーが発生しました");
				loadingfin();
				return;
			}
			loadingfin();
			next();
		} finally {
			loadingfin();
		}
	};
	return (
		<>
			<h3>STEP2.登録内容の確認</h3>
			<div>
				<span className={style.confirm_label}>Bluesky:</span>
				<span>{userdata.current?.bsky_handle}</span>
			</div>
			<div>
				<span className={style.confirm_label}>Github:</span>
				<span>{userdata.current?.github_name}</span>
			</div>
			<div>※登録時に登録完了ポストが投稿されます</div>
			<div className={style.error} id="error">
				{error}
			</div>
			<div className={style.button}>
				<input type="button" value="戻る" className={style.back} onClick={back} />
				<input type="button" value="登録" className={style.next} onClick={send} />
			</div>
		</>
	);
}
function Step3() {
	return (
		<>
			<h3>STEP3.完了</h3>
			<p>
				ご利用いただきありがとうございます。
				<br />
				登録が完了しました。
				<br />
				登録完了ポストが投稿されていることを確認してください。
			</p>
		</>
	);
}
