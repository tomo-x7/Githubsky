import { NextRequest, NextResponse } from "next/server";
import { client } from "../client";

export const dynamic = 'force-static'
export default function GET(){
    return NextResponse.json(client.clientMetadata)
}