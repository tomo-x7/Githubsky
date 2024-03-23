import type { Metadata } from "next";
import Image from "next/image";
import style from "./page.module.css";
import SignUpButton from "./signup";
import Link from "next/link";
export const metadata: Metadata = {
	title: "Githubsky",
	description:
		"前日のGithubのコミット数と直近一週間のヒートマップを自動でBlueskyに投稿するサービスです。",
};

export default function Home() {
	return (
		<>
			<h1>Githubsky V0</h1>
			<p>
				前日のGithubのコミット数と直近一週間のヒートマップを自動でBlueskyに投稿するサービスです。
			</p>
			<h2>STEP1.Blueskyアカウントの連携</h2>
			<p><Link href="https://bsky.app/settings/app-passwords" target="__blank" rel="noopener noreferrer">こちら</Link>からアプリパスワードを生成してください</p>
			<label className={style.label}>
				Blueskyのハンドル
				<input type="text" id="bsky_handle" placeholder="example.bsky.social" />
			</label>
			<label className={style.label}>
				Blueskyのアプリパスワード
				<input type="text" id="bsky_password" placeholder="aaaa-bbbb-cccc-dddd"/>
			</label>
			<SignUpButton accounttype="bluesky" value="連携" />
			<h2>STEP2.Githubアカウントの連携</h2>
			<label className={style.label}>
				Githubのユーザーネーム
				<input type="text" id="github_name" />
			</label>
			<SignUpButton accounttype="github" value="連携" />
			<h2>Q&A</h2>
			<ul>
				<li>登録解除したい<p><Link href="https://bsky.app/settings/app-passwords" target="__blank" rel="noopener noreferrer">こちら</Link>から、Githubskyに登録したアプリパスワードを削除してください。</p></li>
				<li>自動投稿されなくなった<p>ハンドルを変えた、アプリパスワードを削除したなどの可能性があります。もう一度登録してください。</p></li>
			</ul>
		</>
	);
}
