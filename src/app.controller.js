import connectDB from "../DB/connection.js";
import authRouter from "./module/auth/auth.controller.js"
import userRouter from "./module/user/user.controller.js"
import postRouter from './module/post/post.controller.js'
import chatRouter from "./module/chat/chat.controller.js"
import { globalErrorHandling } from "./utils/response/error.response.js";
import path from "path"
import cors from "cors" 
import { createHandler } from "graphql-http/lib/use/express";
import { schema } from "./module/graph.schema.js";

const bootstrap = (app, express)=>
{
    app.use(cors())
    
    app.use('/uploads', express.static(path.resolve("./src/uploads")))

    app.get("/", (req, res)=>{res.send("hello world");})
    app.use(express.json());
    
    app.use("/auth", authRouter);
    app.use("/user", userRouter);
    app.use("/post", postRouter);
    app.use("/chat", chatRouter);

    app.use("/graphql", createHandler({schema:schema}))

    app.use(globalErrorHandling)
    //DB
    connectDB()
}

export default bootstrap