import { roleTypes } from "../../../DB/model/User.model.js";


export const endPoint = {
    createPost: [roleTypes.user],
    freezePost: [roleTypes.user, roleTypes.admin]
}