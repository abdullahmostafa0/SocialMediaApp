import { asyncHandler } from "../../../utils/response/error.response.js";
import * as dbService from "../../../../DB/db.service.js"
import { postModel, privacyTypes } from "../../../../DB/model/Post.model.js";
import cloud from "../../../utils/multer/cloudinary.js"
import { successResponse } from "../../../utils/response/success.response.js";
import { roleTypes } from "../../../../DB/model/User.model.js";
import { commentModel } from "../../../../DB/model/Comment.model.js";


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

    const post = await dbService.create({
        model: postModel, data: {
            ...req.body,
            userId: req.user._id,
            privacy: privacyTypes.public
        }
    })
    return successResponse({ res, data: { post }, status: 201 })
})

export const getPublicPosts = asyncHandler(async (req, res, next) => {


    const populateList = [
        { path: "userId", select: 'username image' },
        {
            path: "comments",
            match: { commentId: { $exists: false } },
            populate: [{
                path: "reply",
                match: { commentId: { $exists: false } },
            }]
        },
        { path: "likes", select: 'username image' },
        { path: "share", select: 'username image' },
        { path: "tags", select: 'username image' },
    ]

    const posts = await dbService.findAll({
        model: postModel, filter: {
            isDeleted: { $exists: false },
            archive: { $exists: false },
            privacy: privacyTypes.public
        },
        populate: populateList
    })
    //find post with there comments
    /*for (const post of posts) {

        const comments = await dbService.findAll({
            model: commentModel,
            filter: {
                postId:post._id,
                isDeleted:{$exists: false}
            }
        })
        resaults.push({post, comments})

    }*/
    /*
        const resaults = []
        const cursor = postModel.find({
            isDeleted: { $exists: false },
            archive: { $exists: false },
            privacy: privacyTypes.public
        }).cursor()
    
        for (let post = await cursor.next(); post != null; post = await cursor.next()) {
            const comments = await dbService.findAll({
                model: commentModel,
                filter: {
                    postId: post._id,
                    isDeleted: { $exists: false }
                }
            })
            resaults.push({ post, comments })*/


    return successResponse({ res, data: { posts }, status: 200 })

})

export const getFriendsPosts = asyncHandler(async (req, res, next) => {


    const populateList = [
        { path: "userId", select: 'username image' },
        { path: "likes", select: 'username image' },
        { path: "share", select: 'username image' },
        { path: "tags", select: 'username image' },
    ]

    const posts = await dbService.findAll({
        model: postModel, filter: {
            isDeleted: { $exists: false },
            archive: { $exists: false },
            //privacy:privacyTypes.friends,
            userFriends: (req.user._id)
        },
        populate: populateList
    })
    return successResponse({ res, data: { posts }, status: 201 })
})
export const getSpecificPosts = asyncHandler(async (req, res, next) => {


    const populateList = [
        { path: "userId", select: 'username image' },
        { path: "likes", select: 'username image' },
        { path: "share", select: 'username image' },
        { path: "tags", select: 'username image' },
    ]
    const posts = await dbService.findAll({
        model: postModel, filter: {
            isDeleted: { $exists: false },
            archive: { $exists: false },
            //privacy:privacyTypes.specific,
            specific: req.user._id
        },
        populate: populateList
    })
    return successResponse({ res, data: { posts }, status: 201 })
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
    
    if (!post) {
        return next(new Error("in valid post id", { cause: 404 }))
    }

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


export const likePost = asyncHandler(async (req, res, next) => {

    const { action } = req.query
    const data = action?.toLowerCase() === 'like' ? { $addToSet: { likes: req.user._id } } : { $pull: { likes: req.user._id } }

    const post = await dbService.findOneAndUpdate({
        model: postModel,
        filter: {
            _id: req.params.postId,
            isDeleted: {
                $exists: false
            },
            archive: {
                $exists: false
            }
        },
        data,
        options: {
            new: true
        }
    })
    return post ? successResponse({ res, data: { post }, status: 200 })
        : next(new Error("in valid post id", { cause: 404 }))
})

export const archivePost = asyncHandler(async (req, res, next) => {

    let post = await dbService.findOne({
        model: postModel,
        filter: {
            _id: req.params.postId,
            isDeleted: {
                $exists: false
            },
            userId: req.user._id
        }
    })
    let timeNow = Date.now()
    if ((timeNow - post.createdAt) <= 86400000) {
        return next(new Error("can't archive post, try again after 24 hour of its creation", { cause: 400 }))
    }

    post = await dbService.findOneAndUpdate({
        model: postModel,
        filter: {
            _id: req.params.postId,
            isDeleted: {
                $exists: false
            },
            userId: req.user._id
        },
        data: {
            archive: true
        },
        options: {
            new: true
        }
    })
    return post ? successResponse({ res, data: { post }, status: 200 })
        : next(new Error("in valid post id", { cause: 404 }))
})

