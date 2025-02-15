import { writeFile } from "node:fs";
import { createImg } from "./image";

const res = createImg({ count: 8, lastweek: [1, 1, 2, 3, 5, 8, 13], github_name: "hoge", star: 2 });
writeFile("test.png", res, () => void 0);
