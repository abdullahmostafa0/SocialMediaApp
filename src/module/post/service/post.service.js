import { asyncHandler } from "../../../utils/response/error.response.js";
import * as dbService from "../../../../DB/db.service.js"
import { postModel } from "../../../../DB/model/Post.model.js";
import cloud from "../../../utils/multer/cloudinary.js"
import { successResponse } from "../../../utils/response/success.response.js";


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
    console.log({...req.body})
    const post  = await dbService.create({
        model: postModel, data: {
            ...req.body,
            userId: req.user._id
        }
    })
    return successResponse({res, data:{post}, status:201})
})