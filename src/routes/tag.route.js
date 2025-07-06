import { Router } from "express";
import {
    createTag,
    getAllTags,
    getTagById,
    updateTagById,
    deleteTagById,
    getTagsByUser,
    searchTagsByName
} from "../controllers/tag.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/createTag").post(verifyJWT, createTag)
router.route("/getAllTags").get(verifyJWT, getAllTags)
router.route("/getTagById").get(verifyJWT, getTagById)
router.route("/updateTagById").put(verifyJWT, updateTagById)
router.route("/deleteTagById").delete(verifyJWT, deleteTagById)
router.route("/getTagsByUser").get(verifyJWT, getTagsByUser)
router.route("/searchTagsByName").get(verifyJWT, searchTagsByName)

export default router