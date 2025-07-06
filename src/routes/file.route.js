import {Router} from "express";
import {
    uploadFile,
    getFileById,
    updateFile,
    deleteFile,
    getFilesByFolder,
    getFilesByOwner,
    searchFilesByTagName,
    searchFilesByFileName,
    filterFilesByType,
    filterFilesBySizeRange,
    bulkDeleteFiles,
    moveFilesToFolder,
    addTagsToFile,
    removeTagsFromFile
} from "../controllers/file.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/uploadFile").post(verifyJWT, uploadFile)
router.route("/updateFile").put(verifyJWT, updateFile)
router.route("/deleteFile").post(verifyJWT, deleteFile)
router.route("/getFileById").get(verifyJWT, getFileById)
router.route("/getFilesByFolder").get(verifyJWT, getFilesByFolder)
router.route("/getFilesByOwner").get(verifyJWT, getFilesByOwner)
router.route("/searchFilesByTagName").get(verifyJWT, searchFilesByTagName)
router.route("/searchFilesByFileName").get(verifyJWT, searchFilesByFileName)
router.route("/filterFilesByType").get(verifyJWT, filterFilesByType)
router.route("/filterFilesBySizeRange").get(verifyJWT, filterFilesBySizeRange)
router.route("/bulkDeleteFiles").delete(verifyJWT, bulkDeleteFiles)
router.route("/moveFilesToFolder").put(verifyJWT, moveFilesToFolder)
router.route("/addTagsToFile").put(verifyJWT, addTagsToFile)
router.route("/removeTagsFromFile").delete(verifyJWT, removeTagsFromFile)

export default router