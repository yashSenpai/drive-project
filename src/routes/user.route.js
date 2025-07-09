import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {registerUser,
    loginUser,
    logoutUser,
    changePassword,
    getCurrentUser,
    updateEmailDetails,
    updateFullnameDetails,
    refreshAccessToken} from "../controllers/user.controller.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

//secured routes are as follows :-

router.route("/logout").post(verifyJWT,logoutUser)
router.route("/change-Password").post(verifyJWT,changePassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/change-email").post(verifyJWT,updateEmailDetails)
router.route("/change-Fullname").post(verifyJWT,updateFullnameDetails)
router.route("/refresh-token").post(refreshAccessToken)

export default router