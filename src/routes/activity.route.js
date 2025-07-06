import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    logActivity,
    getAllActivities,
    getActivitiesByUser,
    getActivitiesByFile,
    getActivitiesByFolder,
    getRecentActivities
} from "../controllers/activity.controller.js"

const router = Router()

router.route("/logActivity").post(verifyJWT, logActivity)
router.route("/getAllActivities").get(verifyJWT, getAllActivities)
router.route("/getActivitiesByUser").get(verifyJWT, getActivitiesByUser)
router.route("/getActivitiesByFile").get(verifyJWT, getActivitiesByFile)
router.route("/getActivitiesByFolder").get(verifyJWT, getActivitiesByFolder)
router.route("/getRecentActivities").get(verifyJWT,getRecentActivities)

export default router