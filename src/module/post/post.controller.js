import { Router } from "express";
const router = Router()
import * as postServices from './service/post.service.js'
import { authentication, authorization } from "../../middleware/auth.middleware.js";
import { endPoint } from "./post.endpoint.js";
import { uploadCloudFile } from "../../utils/multer/cloud.multer.js";
import * as validators from './post.validation.js'
import { validation } from "../../middleware/validation.middleware.js";
import { fileValidationTypes } from "../../utils/multer/local.multer.js";


router.post('/',
    authentication(),
    authorization(endPoint.createPost),
    uploadCloudFile(fileValidationTypes.image).array('image', 2),
    validation(validators.createPost),
    postServices.createPost
)

export default router