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
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/uploadFile").post(verifyJWT, upload.single("url") ,uploadFile)
router.route("/updateFile/:fileId").put(verifyJWT, updateFile)
router.route("/deleteFile/:fileId").delete(verifyJWT, deleteFile)
router.route("/getFileById/:fileId").get(verifyJWT, getFileById)
router.route("/getFilesByFolder/:folderId").get(verifyJWT, getFilesByFolder)
router.route("/getFilesByOwner/:ownerId").get(verifyJWT, getFilesByOwner)
router.route("/searchFilesByTagName/:searchTag").get(verifyJWT, searchFilesByTagName)
router.route("/searchFilesByFileName/:searchText").get(verifyJWT, searchFilesByFileName)
router.route("/filterFilesByType/:type").get(verifyJWT, filterFilesByType)
router.route("/filterFilesBySizeRange").get(verifyJWT, filterFilesBySizeRange)
router.route("/bulkDeleteFiles").delete(verifyJWT, bulkDeleteFiles)
router.route("/moveFilesToFolder").put(verifyJWT, moveFilesToFolder)
router.route("/addTagsToFile/:fileId").put(verifyJWT, addTagsToFile)
router.route("/removeTagsFromFile/:fileId").delete(verifyJWT, removeTagsFromFile)

export default router