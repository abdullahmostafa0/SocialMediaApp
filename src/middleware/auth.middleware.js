import { asyncHandler } from "../utils/response/error.response.js"
import { decodeToken } from "../utils/security/token.security.js"


export const authentication = () => {
    return asyncHandler(async (req, res, next) => {
        
        req.user = await decodeToken({authorization : req.headers.authorization, })
        return next()
    })
}

export const authorization = (accessRoles = []) => {
    return asyncHandler(async (req, res, next) => {
        
        if(!accessRoles.include(req.user.role))
        {
            return new Error("Not authorized account", {cause:403})
        }
        return next()
    })
}