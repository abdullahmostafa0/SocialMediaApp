import { Server } from "socket.io"
import { logOut, regiesterAccount } from "./service/chat.socekt.sevice.js"
import { sendMessage } from "./service/message.service.js"


export const runIo = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
        }
    })
    
    
    io.on("connection", async (socket) => {
        //console.log(socket.handshake.auth)
        await regiesterAccount(socket)
        await sendMessage(socket)
        await logOut(socket)
    })


    
}