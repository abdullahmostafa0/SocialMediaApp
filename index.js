import express from "express"
import bootstrap from "./src/app.controller.js"
import path from "node:path"
import * as dotenv from "dotenv"
dotenv.config({ path: path.resolve("./src/config/.env.dev") })
import { runIo } from "./src/module/chat/chat.socket.js"

const PORT = 3000;
const app = express()


bootstrap(app, express);


const server = app.listen(PORT, () => {
    console.log(`server is runing on port :::: ${PORT}`);
})

runIo(server)






