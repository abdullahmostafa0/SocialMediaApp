import mongoose, { Schema, Types, model } from "mongoose"

export const privacyTypes ={
    public:"public",
    userFriends:"friends",
    specific:"specific"
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
    privacy:{
    type: String,
    enum: Object.values(privacyTypes),
    default: privacyTypes.public
    },
    userFriends:[String],
    specific:[String]
},
{
    timestamps: true,
    toObject:{virtuals:true},
    toJSON:{virtuals:true}
})

postSchema.virtual('comments', {
    localField:"_id",
    foreignField:"postId",
    ref:"Comment"
})

export const postModel = mongoose.models.Post || model("Post", postSchema)


