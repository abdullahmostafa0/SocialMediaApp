import Joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";



export const createPost = Joi.object().keys({

    content: Joi.string().min(2).max(20000).trim(),
    file:Joi.array().items(generalFields.file).max(2)
    
}).or('content', 'file')

export const updatePost = Joi.object().keys({

    content: Joi.string().min(2).max(20000).trim(),
    file:Joi.array().items(generalFields.file).max(2),
    postId: generalFields.id.required()
    
}).or('content', 'file')


export const freezePost = Joi.object().keys({
    postId: generalFields.id.required()
    
}).required()

export const undoPost = Joi.object().keys({
    postId: generalFields.id.required()
    
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

