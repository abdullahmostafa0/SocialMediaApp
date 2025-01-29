import mongoose from "mongoose"


const connectDB = async ()=>{
    return await mongoose.connect(process.env.DB_URI).then(res=>{
        
        console.log("DB connected")

    }).catch(err => console.log(`Fail to connected to DB`, err))
}

export default connectDB