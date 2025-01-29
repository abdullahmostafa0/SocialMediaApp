import {Router} from "express"
import * as userService from './services/user.service.js'
import { authentication } from "../../middleware/auth.middleware.js"
import * as validators from "./user.validation.js"
import { validation } from "../../middleware/validation.middleware.js"
const router = Router()

router.get('/profile', authentication(),userService.profile)
router.get('/profile/:profileId', validation(validators.shareProfile), authentication(), userService.share)
router.patch('/profile', validation(validators.updateBasicProfile), authentication(), userService.updateBasicProfile)
router.patch('/update-password', validation(validators.updatePassword), authentication(), userService.updatePassword)
router.patch('/update-email', validation(validators.updateEmail), authentication(), userService.updateEmail)
router.patch('/replace-email', validation(validators.replaceEmail), authentication(), userService.replaceEmail)
router.get('/two-step-verification',  authentication(), userService.TwoStepVerification)
router.patch('/two-step-confirm', validation(validators.twoStepConfirm), authentication(), userService.TwoStepConfirm)
router.patch('/block-user', validation(validators.blockUser), authentication(), userService.blockUser)
export default router


