import mongoose, { Schema, Types, model } from "mongoose"


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
    deletedBy: { type: Types.ObjectId, ref: "User"},
    isDeleted:Date,
},
    {
        timestamps: true
    })

export const postModel = mongoose.models.Post || model("Post", postSchema)


