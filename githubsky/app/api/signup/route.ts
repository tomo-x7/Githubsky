import { type NextRequest, NextResponse } from "next/server";
import crypto from 'node:crypto'

export const POST=(rawreq:NextRequest)=>{
    


    return NextResponse.json({},{status:200})
}

const encrypt = (raw_text: string,paramiv:string): string|false => {
    try{
	const iv = Buffer.from(paramiv)
	const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(process.env.BLUESKY_PASSWORD_KEY??''), iv)
	let encrypted = cipher.update(raw_text)
  
	encrypted = Buffer.concat([encrypted, cipher.final()])
  
	return encrypted.toString("hex")
    }catch(e){
        console.warn(e)
        return false
    }
};