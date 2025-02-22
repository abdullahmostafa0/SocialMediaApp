import { Router } from "express"
import * as userService from './services/user.service.js'
import { authentication, authorization } from "../../middleware/auth.middleware.js"
import * as validators from "./user.validation.js"
import { validation } from "../../middleware/validation.middleware.js"
import { fileValidationTypes, uploadDiskFile } from "../../utils/multer/local.multer.js"
import { uploadCloudFile } from "../../utils/multer/cloud.multer.js"
import { endPoint } from "./user.endPoint.js"
const router = Router()

router.get('/profile', authentication(), userService.profile)
router.get('/profile/:profileId', validation(validators.shareProfile), authentication(), userService.share)
router.patch('/profile', validation(validators.updateBasicProfile), authentication(), userService.updateBasicProfile)
router.patch('/update-password', validation(validators.updatePassword), authentication(), userService.updatePassword)
router.patch('/update-email', validation(validators.updateEmail), authentication(), userService.updateEmail)
router.patch('/replace-email', validation(validators.replaceEmail), authentication(), userService.replaceEmail)
router.get('/two-step-verification', authentication(), userService.TwoStepVerification)
router.patch('/two-step-confirm', validation(validators.twoStepConfirm), authentication(), userService.TwoStepConfirm)
router.patch('/block-user', validation(validators.blockUser), authentication(), userService.blockUser)

router.patch('/profile/image',
    authentication(),
    //uploadDiskFile("user/profile", fileValidationTypes.image).single('image'), 
    uploadCloudFile(fileValidationTypes.image).single('image'),
    userService.updateImage)

router.patch('/profile/image/cover',
    authentication(),
    //uploadDiskFile("user/profile/cover", fileValidationTypes.image).array('image', 5),
    uploadCloudFile(fileValidationTypes.image).array('image', 2),
    userService.coverImage)
/*
router.patch('/profile/identity',
    authentication(),
    uploadDiskFile("user/profile/identity", [...fileValidationTypes.image, fileValidationTypes.document[1]]).fields([
        { name: "image", maxCount: 1 },
        { name: "document", maxCount: 1 }
    ]),
    userService.identity)
*/

router.get('/profile/admin/dashboard',
    authentication(),
    authorization(endPoint.admin),
    userService.adminDashboard)

router.patch('/profile/admin/change-privileges',
    authentication(),
    authorization(endPoint.admin),
    userService.changePrivileges)

router.patch('/add/:userId',
    authentication(),
    userService.addFriends)



export default router


