import { type NextRequest, NextResponse } from "next/server";
import crypto from 'node:crypto'

export const POST=(rawreq:NextRequest)=>{
    


    return NextResponse.json({},{status:200})
}

const encrypt = (raw_text: string): {encrypted:string,iv:string}|false => {
    try{
	const iv = crypto.randomBytes(16)
	const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(process.env.BLUESKY_PASSWORD_KEY??''), Buffer.from(iv))
	let encrypted = cipher.update(raw_text)
  
	encrypted = Buffer.concat([encrypted, cipher.final()])
  
	return {encrypted:encrypted.toString("hex"),iv:iv.toString("hex")}
    }catch(e){
        console.warn(e)
        return false
    }
};