import Joi from 'joi'
import { generalFields } from '../../middleware/validation.middleware.js'


export const shareProfile = Joi.object().keys({
    profileId:generalFields.id.required()
}).required()

export const updateBasicProfile = Joi.object().keys({
    username: generalFields.username,
    DOB: generalFields.DOB,
    phone: generalFields.phone,
    gender:generalFields.gender
}).required()

export const updatePassword = Joi.object().keys({
    oldPassword: generalFields.password.required(),
    password: generalFields.password.not(Joi.ref('oldPassword')).required(),
    confirmationPassword: generalFields.confirmationPassword.required()
}).required()


export const updateEmail = Joi.object().keys({
    email: generalFields.email.required(),
    
}).required()

export const replaceEmail = Joi.object().keys({
    oldEmailCode: generalFields.code.required(),
    newEmailCode: generalFields.code.required(),
    
}).required()

export const twoStepConfirm = Joi.object().keys({
    otp: generalFields.code.required()
    
}).required()

export const blockUser = Joi.object().keys({
    email: generalFields.email.required()
    
}).required()