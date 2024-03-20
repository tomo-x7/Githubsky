import { createClient } from "@supabase/supabase-js";
import {
	type AtpSessionData,
	type AtpSessionEvent,
	BskyAgent,
} from "@atproto/api";
import { post } from "./bsky";
import { getUsersList } from "./supabase";
import { getUserData } from "./github";
const main = async () => {
	// const testdata=require("./testdata.json")
	//const userslist = getUsersList(process.argv[2], process.argv[3]);
	//post(testdata.bskyhandle, testdata.bskypassword);
	getUserData(testdata.githubname)
};

main();
