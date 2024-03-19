import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
console.log(process.argv[2]);
const supabase = createClient(process.argv[2], process.argv[3]);

supabase
	.from("test")
	.insert({ nanika:crypto.randomUUID() })
	.then((data) => {
		console.log(data);
	});
