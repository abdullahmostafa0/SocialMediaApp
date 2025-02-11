import Joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";



export const createComment = Joi.object().keys({
    postId: generalFields.id.required(),
    content: Joi.string().min(2).max(20000).trim(),
    file: Joi.array().items(generalFields.file).max(2),
    commentId: generalFields.id

}).or('content', 'file')

export const updateComment = Joi.object().keys({

    content: Joi.string().min(2).max(20000).trim(),
    file: Joi.array().items(generalFields.file).max(2),
    postId: generalFields.id.required(),
    commentId: generalFields.id.required()

}).or('content', 'file')


export const freezeComment = Joi.object().keys({
    postId: generalFields.id.required(),
    commentId: generalFields.id.required()

}).required()

export const unfreezeComment = Joi.object().keys({
    postId: generalFields.id.required(),
    commentId: generalFields.id.required()

}).required()

export const restorePost = Joi.object().keys({
    postId: generalFields.id.required()

}).required()

export const archivePost = Joi.object().keys({
    postId: generalFields.id.required()

}).required()

export const likePost = Joi.object().keys({
    postId: generalFields.id.required(),
    action: Joi.string().valid('like', 'unlike').default('like')

}).required()

