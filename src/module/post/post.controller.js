import { Router } from "express";
const router = Router()
import * as postServices from './service/post.service.js'
import { authentication, authorization } from "../../middleware/auth.middleware.js";
import { endPoint } from "./post.endpoint.js";
import { uploadCloudFile } from "../../utils/multer/cloud.multer.js";
import * as validators from './post.validation.js'
import { validation } from "../../middleware/validation.middleware.js";
import { fileValidationTypes } from "../../utils/multer/local.multer.js";
import commentController from '../comment/comment.controller.js'

router.use('/:postId/comment', commentController)

router.post('/create-public',
    authentication(),
    authorization(endPoint.createPost),
    uploadCloudFile(fileValidationTypes.image).array('attachments', 2),
    validation(validators.createPost),
    postServices.createPost
)

router.patch('/update/:postId',
    authentication(),
    authorization(endPoint.createPost),
    uploadCloudFile(fileValidationTypes.image).array('attachments', 2),
    validation(validators.updatePost),
    postServices.updatePost
)

router.delete('/freeze/:postId',
    authentication(),
    authorization(endPoint.freezePost),
    validation(validators.freezePost),
    postServices.freezePost
)

router.patch('/undo/:postId',
    authentication(),
    authorization(endPoint.createPost),
    validation(validators.undoPost),
    postServices.undoPost
)
router.patch('/restore/:postId',
    authentication(),
    authorization(endPoint.createPost),
    validation(validators.restorePost),
    postServices.restorePost
)

router.patch('/archive/:postId',
    authentication(),
    authorization(endPoint.createPost),
    validation(validators.archivePost),
    postServices.archivePost
)

router.patch('/like/:postId',
    authentication(),
    authorization(endPoint.createPost),
    validation(validators.likePost),
    postServices.likePost
)

router.get('/public-posts',
    postServices.getPublicPosts
)

router.get('/friends-posts',
    authentication(),
    authorization(endPoint.createPost),
    postServices.getFriendsPosts
)

router.get('/specific-posts',
    authentication(),
    authorization(endPoint.createPost),
    postServices.getSpecificPosts
)




export default router