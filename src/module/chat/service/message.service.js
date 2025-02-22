import { chatModel } from "../../../../DB/model/Chat.model.js"
import * as dbService from "../../../../DB/db.service.js"
import { authSocket } from "../../../middleware/auth.middleware.js"
import { connectionUser } from "../../../../DB/model/User.model.js"



export const sendMessage = async (socket) => {
    socket.on("sendMessage", async (messageInfo) => {
        console.log(messageInfo)
        const { message, destId } = messageInfo
        const data = await authSocket({ socket })
        if (data.statusCode != 200) {
            return socket.emit("authError", data)
        }
        const userId = data.user._id
        let chat = await dbService.findOneAndUpdate({
            model: chatModel,
            filter: {
                $or: [
                    { mainUser: userId, subParticipant: destId },
                    { mainUser: destId, subParticipant: userId }
                ]
            },
            data: {
                $push: { messages: { senderId: userId, message } }
            }
        })

        if (!chat) {
            await dbService.create({
                model: chatModel,
                data: {
                    mainUser: userId,
                    subParticipant: destId,
                    messages: [{ senderId: userId, message }]
                }
            })
        }
        console.log(chat)
        socket.emit("successMessage", { message })
        socket.to(connectionUser.get(destId.toString())).emit("receiveMessage", { message, chat })
    })
}