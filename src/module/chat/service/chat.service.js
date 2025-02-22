import { chatModel } from "../../../../DB/model/Chat.model.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successResponse } from "../../../utils/response/success.response.js";
import * as dbService from "../../../../DB/db.service.js"

export const getChat = asyncHandler(async (req, res, next) => {

    const { userId } = req.params
    const chat = await dbService.findOne({
        model: chatModel,
        filter: {
            $or: [
                { mainUser: req.user._id, subParticipant: userId },
                { mainUser: userId, subParticipant: req.user._id }
            ]
        },
        populate: [
            { path: "mainUser" },
            { path: "messages.senderId" }
        ]
    })
    
    return successResponse({ res, data: { chat } })
})