import mongoose, { Schema, Types, model } from "mongoose"


export const genderTypes = { male: "male", female: "female" }
export const roleTypes = { user: "user", admin: "admin", superAdmin: "superAdmin" }
export const providerTypes = { system: "system", google: "google" }

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 25,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    emailOtp: String,
    forgetPasswordOtp: String,
    updateEmailOtp: String,
    otpExpireTime: Date,
    triesNumber: {
        type: Number,
        defualt: 0
    },
    panTime: Date,

    password: {
        type: String,
        required: false
    },
    gender: {
        type: String,
        enum: Object.values(genderTypes),
        default: genderTypes.male
    },
    role: {
        type: String,
        enum: Object.values(roleTypes),
        default: roleTypes.user
    },
    provider: {
        type: String,
        enum: Object.values(providerTypes),
        default: providerTypes.system
    },
    phone: String,
    DOB: Date,
    image: { secure_url: String, public_id: String },

    coverImages: [{ secure_url: String, public_id: String }],
    documetns: [String],
    confirmEmail: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    changeCredentialsTime: Date,
    viewers: [{ userId: { type: Types.ObjectId, ref: 'User' }, time: [Date] }],
    twoStepVerification: {
        type: Boolean,
        default: false
    },
    blockAccountsList: [String],
    modifiedBy:{ type: Types.ObjectId, ref: 'User' } 

},
    {
        timestamps: true
    })

export const userModel = mongoose.models.User || model("User", userSchema)


