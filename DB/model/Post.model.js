import mongoose, { Schema, Types, model } from "mongoose"
import * as dbService from "../db.service.js"
import { commentModel } from "./Comment.model.js"
export const privacyTypes = {
    public: "public",
    userFriends: "friends",
    specific: "specific"
}
const postSchema = new Schema({
    content: {
        type: String,
        required: function () {
            return this?.attachments?.length ? false : true
        },
        minlength: 2,
        maxlength: 2000,
        trim: true
    },

    attachments: [{ secure_url: String, public_id: String }],
    likes: [{ type: Types.ObjectId, ref: "User" }],
    tags: [{ type: Types.ObjectId, ref: "User" }],
    share: [{ type: Types.ObjectId, ref: "User" }],
    userId: { type: Types.ObjectId, ref: "User", required: true },
    deletedBy: { type: Types.ObjectId, ref: "User" },
    isDeleted: Date,
    archive: Boolean,
    privacy: {
        type: String,
        enum: Object.values(privacyTypes),
        default: privacyTypes.public
    },
    userFriends: [String],
    specific: [String]
},
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    })

postSchema.virtual('comments', {
    localField: "_id",
    foreignField: "postId",
    ref: "Comment"
})


//delete comments of the post that deleted
postSchema.post("findOneAndUpdate", async function (doc, next) {
    
    const x = this.getUpdate()
    const y = this.getFilter()

    if (x.$set.isDeleted) {

        await dbService.updateMany({
            model: commentModel,
            filter: {
                postId: y._id
            },
            data: {
                isDeleted: Date.now(),
                deletedBy: y.userId
            }
        })
    }
    
    
})

export const postModel = mongoose.models.Post || model("Post", postSchema)


