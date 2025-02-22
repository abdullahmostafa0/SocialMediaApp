import Joi from "joi"
import { genderTypes } from "../../DB/model/User.model.js"
import { Types } from "mongoose"
const validateObjectId = (value, helper) => {
    return Types.ObjectId.isValid(value) ? true : helper.message("In-valied ObjectId")
}
const fileObject = {
    fieldname: Joi.string().valid("attachments"),
    originalname: Joi.string(),
    encoding: Joi.string(),
    mimetype: Joi.string(),
    destination: Joi.string(),
    filename: Joi.string(),
    path: Joi.string(),
    size: Joi.number()
}
export const generalFields = {
    username: Joi.string().min(2).max(25).trim(),
    email: Joi.string().email({ minDomainSegments: 2, maxDomainSegments: 3, tlds: { allow: ["com", "net"] } }),
    password: Joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
    confirmationPassword: Joi.string().valid(Joi.ref('password')),
    phone: Joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
    //acceptLanguage: Joi.string().valid("en", "ar").default("en"),
    gender: Joi.string().valid(genderTypes.male, genderTypes.female),
    id: Joi.string().custom(validateObjectId),
    code: Joi.string().pattern(new RegExp(/^[0-9]{1,4}$/)),
    DOB: Joi.date().less("now"),
    fileObject,
    file: Joi.object(fileObject)
}

export const validation = (schema) => {
    return (req, res, next) => {
        let inputData = { ...req.body, ...req.params, ...req.query }

        if (req.file || req.files?.length) {
            inputData.file = req.file || req.files
        }

        const validationResult = schema.validate(inputData, { abortEarly: false })
        if (validationResult.error) {
            return res.status(400).json({ message: "validation error", details: validationResult.error.details })
        }
        return next()
    }
}


export const validationGraphQL = async ({ schema, data }) => {

    const validationResult = schema.validate(data, { abortEarly: false })
    if (validationResult.error) {
        throw new Error(validationResult.error.message, { cause: 400 })
    }


}