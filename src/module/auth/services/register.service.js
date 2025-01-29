import { userModel } from "../../../../DB/model/User.model.js";
import { emailEvent } from "../../../utils/events/email.event.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { compareHash, generateHash } from "../../../utils/security/hash.security.js";
import * as dbService from '../../../../DB/db.service.js'

export const signup = asyncHandler(
    async (req, res, next)=>{
        
        const {email, username, phone, password} = req.body
        if(await dbService.findOne({model:userModel, filter:{email}}))
        {
            return next(new Error("email exist", {cause: 409}))
        }
        const hashPassword = generateHash({plainText:password})
        const user = await dbService.create({model:userModel, data:{email, username, password:hashPassword}})

        emailEvent.emit("sendEmail", {email})
        return successResponse({res, data:{user}, status:201})
    }
)

export const confirmEmail = asyncHandler(
    async (req, res, next)=>{
        const {email, code} = req.body
        let user = await dbService.findOne({model:userModel, filter:{email}})
        if(!user)
        {
            return next(new Error("email not exist!", {cause:404}))
        }
        if(user.confirmEmail)
        {
            return next(new Error("Already confirmed"), {cause:409})
        }
        if(user.triesNumber == undefined)
        {
            user.triesNumber = 0
        }
        if(!compareHash({plainText:code, hashValue:user.emailOtp}) && user.triesNumber < 5)
        {
            user.triesNumber = user.triesNumber + 1
            user.save()
            if(user.triesNumber >= 5)
            {
                await dbService.updateOne({model:userModel, filter:{email}, data:{panTime:Date.now()}})           
            }
            return next(new Error("In-valid Otp", {cause : 400}))
        }
        
        const timeNow2 = Date.now();
        user = await userModel.findOne({email})
        if(timeNow2 - (user.panTime) < 300000)
        {
            return next(new Error("maximum tries, try again after 5 minutes", {cause:404}))

        }else if((timeNow2 - (user.panTime) >= 300000) && user.triesNumber >= 5)
        {
            await dbService.updateOne({model:userModel, filter:{email}, data:{triesNumber:0}})
        }


        const timeNow = Date.now();
        if((timeNow) - (user.otpExpireTime) > 120000)
        {
            return next(new Error("Otp Time Expired", {cause : 404}))
        }
        await dbService.updateOne({model:userModel, filter:{email}, data:{confirmEmail:true , $unset:{emailOtp:0}}})

        return successResponse({res, status:200, data:{user}})
})

export const resendCode = asyncHandler(
    async (req, res, next)=>{
        const {email} = req.body
        let user = await dbService.findOne({model:userModel, filter:{email}})

        if(user.triesNumber < 5)
        {
            user.triesNumber = user.triesNumber + 1
            user.save()
            if(user.triesNumber >= 5)
            {
                await dbService.updateOne({mdoel:userModel, filter:{email}, data:{panTime:Date.now()}})           
            }
        }
        
        user = await dbService.findOne({model:userModel, filter:{email}})
        const timeNow = Date.now();
        if(timeNow - (user.panTime) < 300000)
        {
            return next(new Error("maximum tries, try again after 5 minutes", {cause:404}))

        }else if((timeNow - (user.panTime) >= 300000) && user.triesNumber >= 5)
        {
            await dbService.updateOne({model:userModel, filter:{email}, data:{triesNumber:0}})
        }

        emailEvent.emit("sendEmail", {email})
        return successResponse({res, data:{user}, status:200})

    }
)

