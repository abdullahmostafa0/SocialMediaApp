import connectDB from "../DB/connection.js";
import authRouter from "./module/auth/auth.controller.js"
import userRouter from "./module/user/user.controller.js"
import postRouter from './module/post/post.controller.js'
import { globalErrorHandling } from "./utils/response/error.response.js";
import path from "path"
import cors from "cors" 

const bootstrap = (app, express)=>
{
    app.use(cors())
    app.use('/uploads', express.static(path.resolve("./src/uploads")))

    app.get("/", (req, res)=>{res.send("hello world");})
    app.use(express.json());
    
    app.use("/auth", authRouter);
    app.use("/user", userRouter);
    app.use("/post", postRouter);

    app.use(globalErrorHandling)
    //DB
    connectDB()
}

export default bootstrap