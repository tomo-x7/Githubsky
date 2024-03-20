import { createClient } from "@supabase/supabase-js";

type UserData = {
	bsky_handle: string;
};
export const getUsersList = (
	supabase_url: string,
	supabase_token: string,
): Array<UserData> => {
	const supabase = createClient(supabase_url, supabase_token);

	return [];
};
