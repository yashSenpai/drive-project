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
router.route("/getTagById/:tagId").get(verifyJWT, getTagById)
router.route("/updateTagById/:tagId").put(verifyJWT, updateTagById)
router.route("/deleteTagById/:tagId").delete(verifyJWT, deleteTagById)
router.route("/getTagsByUser/:userId").get(verifyJWT, getTagsByUser)
router.route("/searchTagsByName/:searchTerm").get(verifyJWT, searchTagsByName)

export default router