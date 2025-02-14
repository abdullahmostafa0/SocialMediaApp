import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from '../../../../DB/db.service.js'
import { roleTypes, userModel } from "../../../../DB/model/User.model.js";
import { emailEvent } from "../../../utils/events/email.event.js";
import { compareHash, generateHash } from "../../../utils/security/hash.security.js";
import cloud from '../../../utils/multer/cloudinary.js';
import { postModel } from "../../../../DB/model/Post.model.js";



export const profile = asyncHandler(async (req, res, next) => {
    const user = await dbService.findOne({
        model: userModel,
        filter: { _id: req.user._id },
        populate: [{ path: "viewers.userId", select: "username email image" }]
    })

    return successResponse({ res, data: { user } })
})

export const share = asyncHandler(async (req, res, next) => {
    const { profileId } = req.params
    const user = await dbService.findOne({
        model: userModel,
        filter: { _id: profileId, isDeleted: false },
        select: "username email DOB phone image"
    })

    if (!user) {
        return next(new Error("In-valid account id", { cause: 404 }))
    }
    //this condition if the same user that loged in wanted to view his profile we not increase number of viewer
    if (profileId != req.user._id.toString()) {
        let flag = 0;
        const user = await dbService.findOne({
            model: userModel,
            filter: { _id: profileId },
            populate: [{ path: "viewers", select: "userId" }]
        })
        //check if the login account in the block list of profileId account
        for (let i = 0; i < user.blockAccountsList.length; i++) {
            if (user.blockAccountsList[i] === req.user.email) {
                return next(new Error("You are blocked", { cause: 400 }))
            }
        }
        for (let i = 0; i < user.viewers.length; i++) {
            if (user.viewers[i].userId.toString() === req.user._id.toString()) {
                user.viewers[i].time.push(Date.now())
                flag = 1;
                if (user.viewers[i].time.length > 5) {
                    user.viewers[i].time.shift()
                    const data = { email: user.email, username: req.user.username, date: user.viewers[i].time }
                    emailEvent.emit('profileViewers', data)
                }
            }
        }
        user.save()
        if (flag == 0) {
            await dbService.updateOne({
                model: userModel,
                filter: { _id: profileId },
                data: { $push: { viewers: { userId: req.user._id, time: Date.now() } } }
            })
            console.log(flag)
        }
    }
    return successResponse({ res, data: { user: req.user } })
})

export const updateBasicProfile = asyncHandler(async (req, res, next) => {
    const user = await dbService.findByIdAndUpdate({
        model: userModel,
        id: req.user._id,
        data: req.body,
        options: {
            new: true
        }
    })

    return successResponse({ res, data: { user } })
})

export const updatePassword = asyncHandler(async (req, res, next) => {
    const { oldPassword, password } = req.body

    if (!compareHash({ plainText: oldPassword, hashValue: req.user.password })) {
        return next(new Error("In-valid old password", { cause: 400 }))
    }

    await dbService.findByIdAndUpdate({
        model: userModel,
        id: req.user._id,
        data: {
            password: generateHash({ plainText: password }),
            changeCredentialsTime: Date.now()
        },
        options: {
            new: true
        }
    })

    return successResponse({ res })
})

export const updateEmail = asyncHandler(async (req, res, next) => {
    const { email } = req.body
    if (await dbService.findOne({ model: userModel, filter: { email } })) {

        return next(new Error("email exist", { cause: 409 }))
    }
    await dbService.updateOne({ model: userModel, filter: { _id: req.user._id }, data: { tempEmail: email } })

    emailEvent.emit("sendEmailTemp", { id: req.user._id, email }) //send code to the new account
    emailEvent.emit("sendEmail", { email: req.user.email })//send code to the old account

    return successResponse({ res })
})

export const replaceEmail = asyncHandler(async (req, res, next) => {
    const { oldEmailCode, newEmailCode } = req.body
    if (await dbService.findOne({ model: userModel, filter: { email: req.user.tempEmail } })) {
        return next(new Error("Email exist", { cause: 409 }))
    }
    if (!compareHash({ plainText: oldEmailCode, hashValue: req.user.emailOtp })) {
        return next(new Error("the code of the old email is incorrect", { cause: 400 }))
    }
    if (!compareHash({ plainText: newEmailCode, hashValue: req.user.updateEmailOtp })) {
        return next(new Error("the code of the new email is incorrect", { cause: 400 }))
    }
    const user = await dbService.findOne({
        model: userModel,
        filter: {_id: req.user._id }
    })
    console.log(user.tempEmail)
    await dbService.updateOne({
        model: userModel, filter: { _id: req.user._id },
        data: {
            email: user.tempEmail,
            changeCredentialsTime: Date.now(),
            $unset: {
                tempEmail: 0,
                emailOtp: 0,
                updateEmailOtp: 0
            }
        }
    })
    return successResponse({ res })
})

export const TwoStepVerification = asyncHandler(async (req, res, next) => {
    //send email to the user with otp
    emailEvent.emit("RequestTwoStep", { email: req.user.email })

    return successResponse({ res })
})

export const TwoStepConfirm = asyncHandler(async (req, res, next) => {

    const { otp } = req.body
    //check if otp is correct
    if (!compareHash({ plainText: otp, hashValue: req.user.emailOtp })) {
        return next(new Error("In-valid Otp", { cause: 400 }))
    }
    //make two step verification true in database
    await dbService.updateOne({ model: userModel, filter: { email: req.user.email }, data: { twoStepVerification: true } })

    return successResponse({ res, message: "tow step verification enabled" })
})

export const blockUser = asyncHandler(async (req, res, next) => {

    const { email } = req.body
    await dbService.updateOne({ model: userModel, filter: { email: req.user.email }, data: { $push: { blockAccountsList: email } } })
    return successResponse({ res })
})

export const updateImage = asyncHandler(async (req, res, next) => {

    const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, { folder: `user/${req.user._id}` })

    const user = await dbService.findByIdAndUpdate({
        model: userModel,
        id: req.user._id,
        data: {
            image: { secure_url, public_id }
        },
        options: {
            new: true
        }
    })
    if (user.image?.public_id) {
        await cloud.uploader.destroy(user.image.public_id)
    }
    return successResponse({ res, data: { file: req.file, user } })
})


export const coverImage = asyncHandler(async (req, res, next) => {
    const images = []
    for (const file of req.files) {

        const { secure_url, public_id } = await cloud.uploader.upload(file.path, { folder: `user/${req.user._id}` })
        images.push({ secure_url, public_id })
    }
    const user = await dbService.findByIdAndUpdate({
        model: userModel,
        id: req.user._id,
        data: {
            //coverImages: req.files.map(file => file.finalPath)
            converImages: images
        },
        options: {
            new: true
        }
    })
    return successResponse({ res, data: { file: req.files, user } })
})


export const adminDashboard = asyncHandler(async (req, res, next) => {


    const data = await Promise.allSettled([
        dbService.findAll({
            model: userModel,
            filter: {}
        }),
        dbService.findAll({
            model: postModel,
            filter: {}
        })
    ])


    return successResponse({ res, data: { data } })
})

export const changePrivileges = asyncHandler(async (req, res, next) => {

    const { userId, role } = req.body

    const owner = req.user.role === roleTypes.superAdmin ? {} :
        { role: { $nin: [roleTypes.admin, roleTypes.superAdmin] } }

    const user = await dbService.findOneAndUpdate({
        model: userModel,
        filter: {
            _id: userId,
            isDeleted: { $exists: false },
            ...owner
        },
        data: {
            role,
            modifiedBy: req.user._id
        },
        options: {
            new: true
        }
    })

    return successResponse({ res, data: { user } })
})
