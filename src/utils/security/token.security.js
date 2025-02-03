import jwt from "jsonwebtoken"
import * as dbService from '../../../DB/db.service.js'
import { userModel } from "../../../DB/model/User.model.js"

export const tokenTypes = {
    access:'access',
    refresh:'refresh'
}
export const decodeToken = async ({ authorization = "", tokenType = tokenTypes.access, next } = {}) => {
    
    const [barrer, token] = authorization?.split(" ") || []

    if (!barrer || !token) {
        return next(new Error("authorization is required or in-valid formate"))
    }
    let accessSignature = ""
    let refreshSignature = ""
    switch (barrer) {
        case 'system':
            accessSignature = process.env.SYSTEM_ACCESS_TOKEN
            refreshSignature = process.env.SYSTEM_REFRESH_TOKEN
            break;
        case 'Barrer':
            accessSignature = process.env.USER_ACCESS_TOKEN
            refreshSignature = process.env.USER_REFRESH_TOKEN
            break;
        default:
            break;
    }
    const decoded = verifyToken({ token, signature : tokenType == tokenTypes.access ? accessSignature : refreshSignature  })
    if (!decoded?.id) {
        return next(new Error("In-valid token payload", { cause: 401 }))
    }
    const user = await dbService.findOne({ model: userModel, filter: { _id: decoded.id, isDeleted: false } })
    if (!user) {
        return next(new Error("In valid account", { cause: 404 }))
    }
    if (user.changeCredentialsTime?.getTime() >= (decoded.iat * 1000)) {
        return next(new Error("Please login again!", { cause: 400 }))
    }

    return user
}

export const generateToken = ({payload = {}, signature = process.env.USER_ACCESS_TOKEN, expiresIn=parseInt(process.env.EXPIRE_IN)} = {})=>{

    const token = jwt.sign(payload, signature, {expiresIn})
    
    return token;
}

export const verifyToken = ({token = "", signature = process.env.USER_ACCESS_TOKEN} = {})=>{

    const decoded = jwt.verify(token, signature)
    return decoded;
}