import { connectionUser } from "../../../../DB/model/User.model.js"
import { authSocket } from "../../../middleware/auth.middleware.js"


export const regiesterAccount = async (socket) => {
    const data = await authSocket({ socket })
    if (data.statusCode != 200) {
        return socket.emit("authError", data)
    }
    connectionUser.set(data.user._id.toString(), socket.id)
    return "done"
}

export const logOut = async (socket) => {

    return socket.on('disconnect', async () => {
        const data = await authSocket({ socket })
        if (data.statusCode != 200) {
            return socket.emit("authError", data)
        }
        connectionUser.delete(data.user._id.toString(), socket.id)
        return "done"
    })
}