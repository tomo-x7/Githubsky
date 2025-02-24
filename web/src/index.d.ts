//worker内のコードをビルドするときに型エラーになる問題に対する暫定対処
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
declare type JsonWebKeyWithKid = any;
