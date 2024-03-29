import type { Metadata } from "next";
import Image from "next/image";
import style from "./page.module.css";
import Link from "next/link";
import { Loading, Steps } from "./steps";
export const metadata: Metadata = {
	title: "Githubsky",
	description: "前日のGithubのコミット数と直近一週間のヒートマップを自動でBlueskyに投稿するサービスです。",
};

export default function Home() {
	/**
	 * アプリパスワード設定ページへのリンク
	 */
	const kotira = (
		<Link href="https://bsky.app/settings/app-passwords" target="__blank" rel="noopener noreferrer">
			こちら
		</Link>
	);
	return (
		<>
			<h1>Githubsky V0</h1>
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
				Githubsky V0.1
				<br />
				Created by{" "}
				<Link href="https://bsky.app/profile/tomo-x.bsky.social" target="__blank" rel="noopener noreferrer">
					@tomo-x
				</Link><br />
				このサービスはオープンソースです。ソースコードは<Link href="https://github.com/tomo-x7/githubsky" target="__blank" rel="noopener noreferrer">こちら</Link>
			</div>
			<Loading />
		</>
	);
}
