import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    createFolder,
    getFolderById,
    getUserFolders,
    getFolderPath,
    getFolderChildren,
    getFolderTree,
    renameFolder,
    updateFolder,
    moveFolder,
    deleteFolder
} from "../controllers/folder.contoller.js"

const router = Router()

router.route("/createFolder").post(verifyJWT, createFolder)
router.route("/getFolderById").get(verifyJWT, getFolderById)
router.route("/getUserFolders").get(verifyJWT, getUserFolders)
router.route("/getFolderPath").get(verifyJWT, getFolderPath)
router.route("/getFolderChildren").get(verifyJWT, getFolderChildren)
router.route("/getFolderTree").get(verifyJWT, getFolderTree)
router.route("/renameFolder").post(verifyJWT, renameFolder)
router.route("/updateFolder").post(verifyJWT, updateFolder)
router.route("/moveFolder").post(verifyJWT, moveFolder)
router.route("/deleteFolder").delete(verifyJWT, deleteFolder)

export default router