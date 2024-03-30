import type { Metadata } from "next";
import Image from "next/image";
import style from "./page.module.css";
import Link from "next/link";
import { Loading, Steps } from "./steps";
export const metadata: Metadata = {
	title: "Githubsky",
	description: "前日のGithubのコミット数と直近一週間のヒートマップを自動でBlueskyに投稿するサービスです。",
	icons:[
		{url:"/favicon.svg",type:"image/svg+xml"}
	],
	openGraph:{
		title:"Githubsky",
		description:"前日のGithubのコミット数と直近一週間のヒートマップを自動でBlueskyに投稿するサービスです。",
		type:"website",
		images:"https://githubsky.vercel.app/ogp.png",
	},
	twitter:{
		title:"Githubsky",
		description:"前日のGithubのコミット数と直近一週間のヒートマップを自動でBlueskyに投稿するサービスです。",
		card:"summary",
		images:"https://githubsky.vercel.app/card.png"
	},
};
type props={
	href:string|URL,
	children?:React.ReactNode|string|undefined
}
const Mylink=({href, children}:props)=>{
	return(
		<Link href={href}  target="__blank" rel="noopener noreferrer">{children}</Link>
	)
}
export default function Home() {
	/**
	 * アプリパスワード設定ページへのリンク
	 */
	const kotira = (
		<Mylink href="https://bsky.app/settings/app-passwords">
			こちら
		</Mylink>
	);
	return (
		<>
			<h1>Githubsky V1</h1>
			<p>前日のGithubのコミット数と直近一週間のコミット数のグラフを自動でBlueskyに投稿するサービスです。</p>
			<div className={style.touroku}><h2>登録はこちら</h2></div>
			<Steps />
			<h2>Q&A</h2>
			<ul>
				<li>
					登録解除したい
					<p>{kotira}から、Githubskyに登録したアプリパスワードを削除してください。</p>
				</li>
				<li>
					自分だけ自動投稿されなくなった
					<p>もう一度登録してみてください。それでもダメな場合は開発者までお問い合わせください</p>
				</li>
				<li>
					二重投稿される
					<p>{kotira}からアプリパスワードをひとつ削除してください</p>
				</li>
				<li>
					設定を変更したい（連携先など）
					<p>一回{kotira}からアプリパスワードを削除して、再登録してください</p>
				</li>
			</ul>
			<hr />
			<div>
				Githubsky V1.0
				<br />
				Created by{" "}
				<Mylink href="https://bsky.app/profile/tomo-x.bsky.social">
					@tomo-x
				</Mylink><br />
				<div>お問い合わせ先:<Mylink href="https://github.com/tomo-x7/githubsky">Github</Mylink>・<Mylink href="https://bsky.app/profile/tomo-x.bsky.social">Bluesky</Mylink>・<Mylink href="https://twitter.com/tomo_x_79">Twitter</Mylink></div>
				このサービスはオープンソースです。ソースコードは<Link href="https://github.com/tomo-x7/githubsky" target="__blank" rel="noopener noreferrer">こちら</Link>
			</div>
			<Loading />
		</>
	);
}
