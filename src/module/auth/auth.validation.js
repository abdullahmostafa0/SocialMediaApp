import Joi from "joi"
import { generalFields } from "../../middleware/validation.middleware.js"
import { providerTypes } from "../../../DB/model/User.model.js"

export const signup = Joi.object().keys({
    username: generalFields.username.required(),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    confirmationPassword: generalFields.confirmationPassword.required()
}).required()

export const confirmEmail = Joi.object().keys({
    email: generalFields.email.required(),
    code : generalFields.code.required()
}).required()

export const resendCode = Joi.object().keys({
    email: generalFields.email.required(),
    
}).required()

export const resendCodeForgetPassword = Joi.object().keys({
    email: generalFields.email.required(),
    
}).required()

export const login = Joi.object().keys({

    email: generalFields.email.required(),
    password: generalFields.password.required(),
    provider: Joi.string().valid(providerTypes.system, providerTypes.google)

}).required()

export const forgetPassword = Joi.object().keys({

    email: generalFields.email.required()

}).required()

export const resetPassword = Joi.object().keys({

    email: generalFields.email.required(),
    code : generalFields.code.required(),
    password: generalFields.password.required(),
    confirmationPassword : generalFields.confirmationPassword.required()
}).required()

export const loginWithOtp = Joi.object().keys({

    email: generalFields.email.required(),
    otp : generalFields.code.required(),

}).required()