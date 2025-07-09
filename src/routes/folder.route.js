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
    moveFolder,
    deleteFolder
} from "../controllers/folder.contoller.js"

const router = Router()

router.route("/createFolder").post(verifyJWT, createFolder)
router.route("/getFolderById/:folderId").get(verifyJWT, getFolderById)
router.route("/getUserFolders/:userId").get(verifyJWT, getUserFolders)
router.route("/getFolderPath/:folderId").get(verifyJWT, getFolderPath)
router.route("/getFolderChildren/:folderId").get(verifyJWT, getFolderChildren)
router.route("/getFolderTree/:folderId").get(verifyJWT, getFolderTree)
router.route("/renameFolder").post(verifyJWT, renameFolder)
router.route("/moveFolder").post(verifyJWT, moveFolder)
router.route("/deleteFolder/:folderId").delete(verifyJWT, deleteFolder)

export default router