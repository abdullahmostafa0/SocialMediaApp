import { Router } from "express";
const router = Router({ mergeParams: true })
import * as commentServices from './service/comment.service.js'
import { authentication, authorization } from "../../middleware/auth.middleware.js";
import { uploadCloudFile } from "../../utils/multer/cloud.multer.js";
import { fileValidationTypes } from "../../utils/multer/local.multer.js";
import { validation } from "../../middleware/validation.middleware.js";
import { endPoint } from "./comment.endpoint.js";
import * as validators from "./comment.validation.js"


router.post('/create/:commentId?',
    authentication(),
    authorization(endPoint.createComment),
    uploadCloudFile(fileValidationTypes.image).array("attachments", 2),
    validation(validators.createComment),
    commentServices.createComment)

router.patch('/update/:commentId',
    authentication(),
    authorization(endPoint.createComment),
    uploadCloudFile(fileValidationTypes.image).array("attachments", 2),
    validation(validators.updateComment),
    commentServices.updateComment)

router.delete('/freeze/:commentId',
    authentication(),
    authorization(endPoint.createComment),
    validation(validators.freezeComment),
    commentServices.freezeComment)

router.patch('/unfreeze/:commentId',
    authentication(),
    authorization(endPoint.createComment),
    validation(validators.unfreezeComment),
    commentServices.unfreezeComment)

export default router