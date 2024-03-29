import './globals.css'
export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<head>
			<meta name="viewport" content="width=device-width,initial-scale=1" />
			</head>
			<body>{children}</body>
		</html>
	);
}
