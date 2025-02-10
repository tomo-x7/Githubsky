import { OAuthClient } from "./index";

const c = await OAuthClient.init();
console.log(c.jwks);
