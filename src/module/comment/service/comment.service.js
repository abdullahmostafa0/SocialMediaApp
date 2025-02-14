import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../../DB/db.service.js"
import { postModel } from "../../../../DB/model/Post.model.js";
import { commentModel } from "../../../../DB/model/Comment.model.js";
import cloud from '../../../utils/multer/cloudinary.js'
import { roleTypes } from "../../../../DB/model/User.model.js";

export const createComment = asyncHandler(async (req, res, next) => {

    const { postId, commentId } = req.params

    if (commentId) {

        const checkComment = await dbService.findOne({
            model: commentModel,
            filter: {
                _id: commentId,
                postId,
                isDeleted: { $exists: false }
            }
        })
        if (!checkComment) {
            return next(new Error("can not reply on in valid comment", { cause: 404 }))
        }
        req.body.commentId = commentId
    }
    const post = await dbService.findOne({
        model: postModel,
        filter: {
            _id: postId,
            isDeleted: { $exists: false }
        }
    })
    if (!post) {

        return next(new Error("In-valid Id post", { cause: 404 }))
    }
    if (req.files?.length) {

        const attachments = []
        for (const file of req.files) {

            const { secure_url, public_id } = await cloud.uploader.upload(file.path,
                { folder: `${process.env.APP_NAME}/user/${post.userId}/post/comment` })
            attachments.push({ secure_url, public_id })
        }
        req.body.attachments = attachments

    }
    else {
        req.body.attachments = []
    }

    const comment = await dbService.create({
        model: commentModel, data: {
            ...req.body,
            postId,
            userId: req.user._id,
        }
    })

    return successResponse({ res, status: 201, data: { comment } })
})

export const updateComment = asyncHandler(async (req, res, next) => {

    const { postId, commentId } = req.params


    const comment = await dbService.findOne({
        model: commentModel, filter: {
            _id: commentId,
            postId,
            isDeleted: { $exists: false }
        },
        populate: {
            path: "postId"
        }
    })

    if (!comment || comment.postId.isDeleted) {
        return next(new Error("In-valid comment", { cause: 404 }))
    }

    if (req.files?.length) {

        const attachments = []
        for (const file of req.files) {

            const { secure_url, public_id } = await cloud.uploader.upload(file.path,
                { folder: `${process.env.APP_NAME}/user/${comment.postId.userId}/post/comment` })
            attachments.push({ secure_url, public_id })
        }
        req.body.attachments = attachments

    }
    else {
        req.body.attachments = []
    }
    const savedComment = await dbService.findOneAndUpdate({
        model: commentModel, filter: {
            _id: commentId,
            postId,
            isDeleted: { $exists: false }
        },
        data: req.body,
        options: { new: true }
    })

    return successResponse({ res, status: 201, data: { savedComment } })
})

export const freezeComment = asyncHandler(async (req, res, next) => {

    const { postId, commentId } = req.params

    const Comment = await dbService.findOne({
        model: commentModel, filter: {
            _id: commentId,
            postId,
            isDeleted: { $exists: false }
        },
        populate: {
            path: "postId"
        }
    })
    if (!Comment ||
        (
            req.user.role != roleTypes.admin
            &&
            req.user._id.toString() != commentId
            &&
            req.user._id.toString() != Comment.postId.userId.toString()
        )) {
        return next(new Error("in valid comment or not authorized", { cause: 404 }))
    }
    const savedComment = dbService.findOneAndUpdate({
        model: commentModel,
        filter: {
            _id: commentId,
            postId,
            isDeleted: { $exists: false }
        },
        data: {
            isDeleted: Date.now(),
            deletedBy: req.user._id
        },
        options: { new: true }
    })
    return successResponse({ res, status: 200, data: { savedComment } })
})
export const unfreezeComment = asyncHandler(async (req, res, next) => {

    const { postId, commentId } = req.params


    const savedComment = dbService.findOneAndUpdate({
        model: commentModel,
        filter: {
            _id: commentId,
            postId,
            isDeleted: { $exists: true },
            deletedBy: req.user._id
        },
        data: {
            $unset: {
                isDeleted: "",
                deletedBy: ""
            }

        },
        options: { new: true }
    })
    return successResponse({ res, status: 200, data: { savedComment } })
})
