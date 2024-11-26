import {client,redis} from "../client"
import crypto from "node:crypto";
import { Agent } from "@atproto/api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const params = new URL(req.url).searchParams;
	try {
		const { session, state } = await client.callback(params);
		const sessionID = Buffer.from(crypto.getRandomValues(new Uint32Array(10)).buffer).toString("base64url");
		redis.setredis(`mysession_${sessionID}`, session.did, 7200);
		const agent = new Agent(session);
		const profile = (await agent.getProfile({ actor: session.did })).data;
        const res= new NextResponse(`<script>
				localStorage.setItem("handle","${profile.handle}");
				localStorage.setItem("icon","${profile.avatar}");
				window.location="/";
				</script>`,)
        res.cookies.set("session",sessionID,{httpOnly:true,secure:true,sameSite:"lax",maxAge:7200,path:"/"})
		return res
	} catch {
        return new NextResponse("failed auth",{status:400})
	}
}