import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

const supabase = createClient(process.env.SUPABASE_URL ?? "", process.env.SUPABASE_SERVICE_ROLE_KEY ?? "");
export const POST = async (rawreq: NextRequest) => {
	const req: {
		DID: string;
		bsky_handle?: string;
		bsky_password: string;
		github_name: string;
		Github_token?: string;
		bsky_pds?: string;
	} = await rawreq.json();
	const { encrypted: password, iv } = encrypt(req.bsky_password) || { encrypted: "", iv: "" };
	await supabase
		.from("test")
		.upsert({
			bsky_handle: req.bsky_handle,
			bsky_password: password,
			github_name: req.github_name,
			DID: req.DID,
			iv: iv,
			Github_token: req.Github_token,
			PDS: req.bsky_pds,
		})
		.eq("DID", req.DID)
		.then((data) => {
			if (Math.floor(data.status / 100) !== 2) {
				return NextResponse.json({}, { status: 400 });
			}
		});

	return NextResponse.json({}, { status: 200 });
};

const encrypt = (raw_text: string): { encrypted: string; iv: string } | false => {
	try {
		const iv = crypto.randomBytes(16);
		const cipher = crypto.createCipheriv(
			"aes-256-cbc",
			Buffer.from(process.env.BLUESKY_PASSWORD_KEY ?? ""),
			Buffer.from(iv),
		);
		let encrypted = cipher.update(raw_text);

		encrypted = Buffer.concat([encrypted, cipher.final()]);

		return { encrypted: encrypted.toString("hex"), iv: iv.toString("hex") };
	} catch (e) {
		console.warn(e);
		return false;
	}
};
