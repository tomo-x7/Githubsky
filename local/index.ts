import dotenv from "dotenv";
import { supabase } from "./supabase";
dotenv.config();

async function main() {
	const db = new supabase();
}
