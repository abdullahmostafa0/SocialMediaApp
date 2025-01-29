import connectDB from "../DB/connection.js";
import authRouter from "./module/auth/auth.controller.js"
import userRouter from "./module/user/user.controller.js"
import { globalErrorHandling } from "./utils/response/error.response.js";

const bootstrap = (app, express)=>
{
    app.get("/", (req, res)=>{res.send("hello world");})
    app.use(express.json());
    app.use("/auth", authRouter);
    app.use("/user", userRouter);

    app.use(globalErrorHandling)
    //DB
    connectDB()
}

export default bootstrap