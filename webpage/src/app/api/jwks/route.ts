import { NextResponse } from "next/server";
import { client } from "../client";

export const dynamic = "force-static";
export async function GET() {
	return NextResponse.json(client.jwks);
}
