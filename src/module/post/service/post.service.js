import { asyncHandler } from "../../../utils/response/error.response.js";
import * as dbService from "../../../../DB/db.service.js"
import { postModel } from "../../../../DB/model/Post.model.js";
import cloud from "../../../utils/multer/cloudinary.js"
import { successResponse } from "../../../utils/response/success.response.js";
import { roleTypes } from "../../../../DB/model/User.model.js";


export const createPost = asyncHandler(async (req, res, next) => {

    const { bio } = req.body
    if (req.files) {

        const attachments = []
        for (const file of req.files) {

            const { secure_url, public_id } = await cloud.uploader.upload(file.path, { folder: "post" })
            attachments.push({ secure_url, public_id })
        }
        req.body.attachments = attachments

    }
    else {
        req.body.attachments = []
    }
    console.log(req.body.images)
    console.log(req.files)
    console.log({ ...req.body })
    const post = await dbService.create({
        model: postModel, data: {
            ...req.body,
            userId: req.user._id
        }
    })
    return successResponse({ res, data: { post }, status: 201 })
})

export const updatePost = asyncHandler(async (req, res, next) => {

    const { bio } = req.body
    if (req.files?.length) {

        const attachments = []
        for (const file of req.files) {

            const { secure_url, public_id } = await cloud.uploader.upload(file.path, { folder: "post" })
            attachments.push({ secure_url, public_id })
        }
        req.body.attachments = attachments

    }
    else {
        req.body.attachments = []
    }
    const post = await dbService.findOneAndUpdate({
        model: postModel,
        filter: {
            _id: req.params.postId,
            isDeleted: {
                $exists: false
            },
            userId: req.user._id
        },
        data: {
            ...req.body,
            userId: req.user._id
        },
        options: {
            new: true
        }
    })
    return post ? successResponse({ res, data: { post }, status: 200 })
        : next(new Error("in valid post id", { cause: 404 }))
})


export const freezePost = asyncHandler(async (req, res, next) => {

    const owner = req.user.role === roleTypes.admin ? {} : { userId: req.user._id }

    const post = await dbService.findOneAndUpdate({
        model: postModel,
        filter: {
            _id: req.params.postId,
            isDeleted: {
                $exists: false
            },
            ...owner
        },
        data: {
            isDeleted: Date.now(),
            deletedBy: req.user._id
        },
        options: {
            new: true
        }
    })
    return post ? successResponse({ res, data: { post }, status: 200 })
        : next(new Error("in valid post id", { cause: 404 }))
})

export const undoPost = asyncHandler(async (req, res, next) => {

    const timeNow = Date.now()
    //check if the time of deletion exceed two minutes or no
    let post = await dbService.findOne({
        model: postModel,
        filter: {
            _id: req.params.postId,
            userId: req.user._id
        }
    })
    if (timeNow - (post.isDeleted) >= 120000) {
        return next(new Error("Can't undo now only within two minutes of deletion", { cause: 400 }))
    }
    //unset (isDeleted) in the DB
    post = await dbService.findOneAndUpdate({
        model: postModel,
        filter: {
            _id: req.params.postId,
            userId: req.user._id
        },
        data: {
            $unset: {
                isDeleted: "",
                deletedBy: ""
            }
        },
        options: {
            new: true
        }
    })
    return post ? successResponse({ res, data: { post }, status: 200 })
        : next(new Error("in valid post id", { cause: 404 }))
})

export const restorePost = asyncHandler(async (req, res, next) => {

    const post = await dbService.findOneAndUpdate({
        model: postModel,
        filter: {
            _id: req.params.postId,
            isDeleted: {
                $exists: true
            },
            deletedBy: req.user._id
        },
        data: {
            $unset: {
                isDeleted:"",
                deletedBy:""
            }

        },
        options: {
            new: true
        }
    })
    return post ? successResponse({ res, data: { post }, status: 200 })
        : next(new Error("in valid post id", { cause: 404 }))
})