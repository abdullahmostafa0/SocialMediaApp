
import { EventEmitter } from "node:events";
import {sendEmail } from "../email/send.email.js";
import { customAlphabet } from "nanoid";
import { verficationEmailTemplates } from "../email/template/verfication.email.js";
import { generateHash } from "../security/hash.security.js";
import { userModel } from "../../../DB/model/User.model.js";
import * as dbService from '../../../DB/db.service.js'
export const emailEvent = new EventEmitter()

emailEvent.on("sendEmail", async (data)=>{
    const {email} = data
    const otp = customAlphabet("0123456789", 4)()
    const html = verficationEmailTemplates({code:otp})
    const emailOtpHash = generateHash({plainText:`${otp}`})
    await dbService.updateOne({model:userModel, filter:{email}, data:{emailOtp:emailOtpHash, otpExpireTime:Date.now()}})
    await sendEmail({to:email, subject:"Confirm Email", html})

})

emailEvent.on("sendForgetPassword", async (data)=>{
    const {email} = data
    const otp = customAlphabet("0123456789", 4)()
    const html = verficationEmailTemplates({code:otp})
    const forgetPasswordHash = generateHash({plainText:`${otp}`})
    await dbService.updateOne({model:userModel, filter:{email}, data:{forgetPasswordOtp:forgetPasswordHash, otpExpireTime:Date.now()}})
    await sendEmail({to:email, subject:"Forget Password", html})

})

emailEvent.on("profileViewers", async (data)=>{
    const {email, username, date} = data
    const html = `<h4>${username} has viewed your account 5 times at these time periods:${date}</h4>`
    await sendEmail({to:email, subject:"Veiwers", html})

})


emailEvent.on("sendEmailTemp", async (data)=>{
    const {id, email} = data
    const otp = customAlphabet("0123456789", 4)()
    const html = verficationEmailTemplates({code:otp})
    const emailOtpHash = generateHash({plainText:`${otp}`})
    await dbService.updateOne({model:userModel, filter:{_id:id}, data:{updateEmailOtp:emailOtpHash}})
    await sendEmail({to:email, subject:"Confirm Update Email", html})

})

emailEvent.on("RequestTwoStep", async (data)=>{
    const {email} = data
    const otp = customAlphabet("0123456789", 4)()
    const html = verficationEmailTemplates({code:otp})
    const emailOtpHash = generateHash({plainText:`${otp}`})
    await dbService.updateOne({model:userModel, filter:{email}, data:{emailOtp:emailOtpHash, otpExpireTime:Date.now()}})
    await sendEmail({to:email, subject:"Confirm Otp", html})

})

emailEvent.on("loginOtp", async (data)=>{
    const {email} = data
    const otp = customAlphabet("0123456789", 4)()
    const html = verficationEmailTemplates({code:otp})
    const emailOtpHash = generateHash({plainText:`${otp}`})
    await dbService.updateOne({model:userModel, filter:{email}, data:{emailOtp:emailOtpHash, otpExpireTime:Date.now()}})
    await sendEmail({to:email, subject:"Confirm Two Step Verification", html})

})

