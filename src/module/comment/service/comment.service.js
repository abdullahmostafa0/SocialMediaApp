import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../../DB/db.service.js"
import { postModel } from "../../../../DB/model/Post.model.js";
import { commentModel } from "../../../../DB/model/Comment.model.js";
import cloud from '../../../utils/multer/cloudinary.js'

export const createComment = asyncHandler(async (req, res, next) => {

    const { postId } = req.params
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
    return successResponse({ res , status:201, data:{comment, files:req.files}})
})
