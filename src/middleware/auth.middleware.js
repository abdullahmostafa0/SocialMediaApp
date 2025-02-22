import { asyncHandler } from "../utils/response/error.response.js"
import { decodeToken, tokenTypes, verifyToken } from "../utils/security/token.security.js"
import * as dbService from "../../DB/db.service.js"
import { userModel } from "../../DB/model/User.model.js"


export const authentication = () => {
    return asyncHandler(async (req, res, next) => {

        req.user = await decodeToken({ authorization: req.headers.authorization, next })
        return next()
    })
}

export const authorization = (accessRoles = []) => {
    return asyncHandler(async (req, res, next) => {

        if (!accessRoles.includes(req.user.role)) {
            return new Error("Not authorized account", { cause: 403 })
        }
        return next()
    })
}

export const graphAuth = async ({ authorization = "", tokenType = tokenTypes.access, accessRoles = [] } = {}) => {

    const [barrer, token] = authorization?.split(" ") || []

    if (!barrer || !token) {
        throw new Error("authorization is required or in-valid formate")
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
    const decoded = verifyToken({ token, signature: tokenType == tokenTypes.access ? accessSignature : refreshSignature })
    if (!decoded?.id) {
        throw new Error("In-valid token payload", { cause: 401 })
    }
    const user = await dbService.findOne({ model: userModel, filter: { _id: decoded.id, isDeleted: false } })
    if (!user) {
        throw new Error("In valid account", { cause: 404 })
    }
    if (user.changeCredentialsTime?.getTime() >= (decoded.iat * 1000)) {
        throw new Error("Please login again!", { cause: 400 })
    }

    if (!accessRoles.includes(user.role)) {
        throw new Error("Not authorized account", { cause: 403 })
    }
    return user
}


export const authSocket = async ({ socket }) => {
    
    let tokenType = tokenTypes.access
    const [barrer, token] = socket?.handshake?.auth?.authorization?.split(" ") || []

    if (!barrer || !token) {
        return { message: "authorization is required or in-valid formate", statusCode: 401 }
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
    
    const decoded = verifyToken({ token, signature : tokenType == tokenTypes.access ? accessSignature : refreshSignature })
    if (!decoded?.id) {
        return { message: "In-valid token payload", statusCode: 401 }

    }
    const user = await dbService.findOne({ model: userModel, filter: { _id: decoded.id, isDeleted: false } })
    if (!user) {
        return { message: "In valid account", statusCode: 404 }
    }
    if (user.changeCredentialsTime?.getTime() >= (decoded.iat * 1000)) {
        
        return { message: "Please login again!", statusCode: 400 }
    }

    return {user, statusCode: 200}
    

}