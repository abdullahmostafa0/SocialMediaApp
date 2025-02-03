import Joi from "joi";



export const createPost = Joi.object().keys({

    bio: Joi.string().min(2).max(20000).trim(),
    file:Joi.object().options({allowUnknown:true})


}).or('bio', 'file')