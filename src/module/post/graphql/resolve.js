import * as dbService from "../../../../DB/db.service.js"
import { postModel } from "../../../../DB/model/Post.model.js";
import { roleTypes } from "../../../../DB/model/User.model.js";
import { graphAuth } from "../../../middleware/auth.middleware.js";
import { validationGraphQL } from "../../../middleware/validation.middleware.js";
import { likePost } from "../post.validation.js";



export const getPost = async (parent, args) => {
    const { id } = args
    const post = await dbService.findOne({
        model: postModel,
        filter: {
            _id: id
        }
    })
    return post
}


export const getAllPosts = async (parent, args) => {

    const posts = await dbService.findAll({
        model: postModel,
        populate: [{ path: "userId" }]
    })
    return posts
}

export const likePosts = async (parent, args) => {

    const { action, authorization } = args
    //validation
    await validationGraphQL({ schema: likePost, data: { action: args.action, postId: args.postId } })

    //athentication function
    const user = await graphAuth({ authorization, accessRoles: [roleTypes.user] })

    const data = action?.toLowerCase() === 'like' ? { $addToSet: { likes: user._id } } : { $pull: { likes: user._id } }

    const post = await dbService.findOneAndUpdate({
        model: postModel,
        filter: {
            _id: args.postId,
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
    if (!post) {
        throw new Error("Post not found or deleted", { cause: 404 })
    }
    return { post: post }
}