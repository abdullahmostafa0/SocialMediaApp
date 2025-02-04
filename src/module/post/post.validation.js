import Joi from "joi";



export const createPost = Joi.object().keys({

    content: Joi.string().min(2).max(20000).trim(),
    file:Joi.object().options({allowUnknown:true})
    


}).or('content', 'file')