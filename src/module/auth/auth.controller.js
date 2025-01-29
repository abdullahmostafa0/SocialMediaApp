import {Router} from 'express'
import * as resgisterService from "./services/register.service.js";
import * as loginService from "./services/login.service.js";
import { validation } from '../../middleware/validation.middleware.js';
import * as validators from "./auth.validation.js"
const router = Router();

router.post("/signup", validation(validators.signup),resgisterService.signup);

router.patch("/confirm-email", validation(validators.confirmEmail), resgisterService.confirmEmail);
router.post("/resend-code",  validation(validators.resendCode), resgisterService.resendCode);
router.post("/login", validation(validators.login), loginService.login);
router.post("/loginWithGmail", loginService.loginWithGmail);
router.get("/refresh-token", loginService.refreshToken);
router.patch("/forget-password", validation(validators.forgetPassword), loginService.forgetPassword);
router.patch("/reset-password", validation(validators.resetPassword), loginService.resetPassword);
router.post("/resend-code-forget-password",  validation(validators.resendCodeForgetPassword), loginService.resendCodeForgetPassword);
router.post("/login-with-otp", validation(validators.loginWithOtp), loginService.loginWithOtp);
export default router