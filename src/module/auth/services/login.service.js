import { providerTypes, roleTypes, userModel } from "../../../../DB/model/User.model.js"
import { emailEvent } from "../../../utils/events/email.event.js"
import { asyncHandler } from "../../../utils/response/error.response.js"
import { successResponse } from "../../../utils/response/success.response.js"
import { compareHash, generateHash } from "../../../utils/security/hash.security.js"
import { decodeToken, generateToken, verifyToken } from "../../../utils/security/token.security.js"
import { OAuth2Client } from 'google-auth-library';
import * as dbService from '../../../../DB/db.service.js'

export const login = asyncHandler(
    async (req, res, next) => {

        const { email, password } = req.body
        const user = await dbService.findOne({ model: userModel, filter: { email } })
        if (user.twoStepVerification == true) {
            if (!user) {
                return next(new Error("user not found", { cause: 404 }))
            }
            if (!user.confirmEmail) {
                return next(new Error("please confirm email first", { cause: 400 }))
            }
            if (!compareHash({ plainText: password, hashValue: user.password })) {
                return next(new Error("In-valid user password", { cause: 404 }))
            }
            if (user.provider != providerTypes.system) {
                return next(new Error("In valid user provider", { cause: 404 }))
            }
            emailEvent.emit("loginOtp", { email })
            return successResponse({ res, message: "Otp is sent" })
        }
        else {
            if (!user) {
                return next(new Error("user not found", { cause: 404 }))
            }
            if (!user.confirmEmail) {
                return next(new Error("please confirm email first", { cause: 400 }))
            }
            if (!compareHash({ plainText: password, hashValue: user.password })) {
                return next(new Error("In-valid user password", { cause: 404 }))
            }
            if (user.provider != providerTypes.system) {
                return next(new Error("In valid user provider", { cause: 404 }))
            }
            const accessToken = generateToken({ payload: { id: user._id }, signature: user.role === roleTypes.admin ? process.env.SYSTEM_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN })
            const refreshToken = generateToken({ payload: { id: user._id }, signature: user.role === roleTypes.admin ? process.env.SYSTEM_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN, expiresIn: 31536000 })
            return successResponse({
                res, data: {
                    token: {
                        accessToken,
                        refreshToken
                    }
                }, status: 200
            })
        }



    }
)

export const loginWithGmail = asyncHandler(
    async (req, res, next) => {
        const { idToken } = req.body

        const client = new OAuth2Client();
        async function verify() {
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.CLIENT_ID,
            });
            const payload = ticket.getPayload();
            console.log(payload)
            return payload

        }
        const payload = await verify()

        if (!payload.email_verified) {
            return next(new Error("In valid Account", { cause: 404 }))
        }
        let user = await dbService.findOne({ model: userModel, filter: { email: payload.email } })


        if (user?.provider === providerTypes.system) {
            return next(new Error("In-valid login provider", { cause: 404 }))
        }
        if (!user) {
            user = await dbService.create({
                model: userModel, data: {
                    confirmEmail: payload.email_verified,
                    email: payload.email,
                    username: payload.name,
                    image: payload.picture,
                    provider: providerTypes.google
                }
            })

        }
        const accessToken = generateToken({ payload: { id: user._id }, signature: user.role === roleTypes.admin ? process.env.SYSTEM_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN })
        const refreshToken = generateToken({ payload: { id: user._id }, signature: user.role === roleTypes.admin ? process.env.SYSTEM_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN, expiresIn: 31536000 })

        return successResponse({
            res, data: {
                token: {
                    accessToken,
                    refreshToken
                }
            }, status: 200
        })
    }
)

export const refreshToken = asyncHandler(

    async (req, res, next) => {
        const user = await decodeToken({ authorization: req.headers.authorization, next})

        const accessToken = generateToken({ payload: { id: user._id }, signature: user.role === roleTypes.admin ? process.env.SYSTEM_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN })
        const refreshToken = generateToken({ payload: { id: user._id }, signature: user.role === roleTypes.admin ? process.env.SYSTEM_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN, expiresIn: 31536000 })
        return successResponse({
            res, data: {
                token: {
                    accessToken,
                    refreshToken
                }
            }, status: 200
        })
    }
)

export const forgetPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body
    const user = await dbService.findOne({ model: userModel, filter: { email, isDeleted: false } })
    if (!user) {
        return next(new Error("In-valid account", { cause: 404 }))
    }

    emailEvent.emit("sendForgetPassword", { email })

    return successResponse({ res })
})
export const resetPassword = asyncHandler(async (req, res, next) => {
    const { email, code, password } = req.body
    let user = await dbService.findOne({ model: userModel, filter: { email, isDeleted: false } })
    if (!user) {
        return next(new Error("In-valid account", { cause: 404 }))
    }
    if (user.triesNumber == undefined) {
        user.triesNumber = 0
    }
    if ((!compareHash({ plainText: code, hashValue: user.forgetPasswordOtp }) && user.triesNumber < 5)) {
        user.triesNumber = user.triesNumber + 1
        user.save()
        console.log(user.triesNumber)
        if (user.triesNumber >= 5) {
            await dbService.updateOne({ model: userModel, filter: { email }, data: { panTime: Date.now() } })

        }
        return next(new Error("In valid otp", { cause: 400 }))
    }
    const timeNow2 = Date.now();
    user = await dbService.findOne({ model: userModel, filter: { email } })
    if (timeNow2 - (user.panTime) < 300000) {
        return next(new Error("maximum tries, try again after 5 minutes", { cause: 404 }))

    } else if ((timeNow2 - (user.panTime) >= 300000) && user.triesNumber >= 5) {
        await dbService.updateOne({ model: userModel, filter: { email }, data: { triesNumber: 0 } })
    }

    const timeNow = Date.now();
    if ((timeNow) - (user.otpExpireTime) > 120000) {
        return next(new Error("Otp Time Expired", { cause: 404 }))
    }

    const hashPassword = generateHash({ plainText: password })
    await dbService.updateOne({
        model: userModel, filter: { email },
        data: {
            password: hashPassword,
            confirmEmail: true,
            changeCredentialsTime: Date.now(),
            $unset: { forgetPasswordOtp: 0, emailOtp: 0 }
        }
    })

    return successResponse({ res })
})

export const resendCodeForgetPassword = asyncHandler(
    async (req, res, next) => {
        const { email } = req.body
        let user = await dbService.findOne({ model: userModel, filter: { email } })

        if (user.triesNumber < 5) {
            user.triesNumber = user.triesNumber + 1
            user.save()
            if (user.triesNumber >= 5) {
                await dbService.updateOne({ model: userModel, filter: { email }, date: { panTime: Date.now() } })
            }
        }

        user = await dbService.findOne({ model: userModel, filter: { email } })
        const timeNow = Date.now();
        if (timeNow - (user.panTime) < 300000) {
            return next(new Error("maximum tries, try again after 5 minutes", { cause: 404 }))

        } else if ((timeNow - (user.panTime) >= 300000) && user.triesNumber >= 5) {
            await dbService.updateOne({ model: userModel, filter: { email }, date: { triesNumber: 0 } })
        }

        emailEvent.emit("sendForgetPassword", { email })
        return successResponse({ res, data: { user }, status: 200 })

    }
)

export const loginWithOtp = asyncHandler(async (req, res, next) => {
    const { email, otp } = req.body

    const user = await dbService.findOne({ model: userModel, filter: { email } })
    
    if (!compareHash({ plainText: otp, hashValue: user.emailOtp })) {
        return next(new Error("In-Valid Otp", { cause: 400 }))
    }
    
    const accessToken = generateToken({ payload: { id: user._id }, signature: user.role === roleTypes.admin ? process.env.SYSTEM_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN })
    const refreshToken = generateToken({ payload: { id: user._id }, signature: user.role === roleTypes.admin ? process.env.SYSTEM_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN, expiresIn: 31536000 })
    return successResponse({
        res, data: {
            token: {
                accessToken,
                refreshToken
            }
        }, status: 200
    })

})