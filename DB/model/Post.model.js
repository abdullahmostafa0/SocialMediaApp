import mongoose, {Schema , Types, model} from "mongoose"


const postSchema = new Schema ({
    bio:{
        type:String,
        required:(data)=>{
            return data?.images?.length? false : true
        },
        minlength:2,
        maxlength:2000,
        trim: true
    },

    images:[{secure_url:String, public_id:String}],
    likes:[{type: Types.ObjectId, ref:"User"}],
    userId:{type: Types.ObjectId, ref:"User", required:true},
    isDeleted:{
        type:Boolean,
        default:false
    },

},
{
    timestamps:true
})  

export const postModel = mongoose.models.Post || model("Post", postSchema)


