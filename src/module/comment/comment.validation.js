import Joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";



export const createComment = Joi.object().keys({
    postId: generalFields.id.required(),
    content: Joi.string().min(2).max(20000).trim(),
    file:Joi.object().options({allowUnknown:true})
    
}).or('content', 'file')

export const updatePost = Joi.object().keys({

    content: Joi.string().min(2).max(20000).trim(),
    file:Joi.object().options({allowUnknown:true}),
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

