import { roleTypes } from "../../../DB/model/User.model.js";


export const endPoint = {
    createComment: [roleTypes.user],
    freezeComment: [roleTypes.user, roleTypes.admin]
}