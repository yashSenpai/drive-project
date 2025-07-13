import { ApiError } from "../utils/ApiError.js"
import { File } from "../models/file.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/fileUpload.js"
import { deleteFromCloudinary } from "../utils/fileDeletion.js"

const uploadFile = asyncHandler(async(req,res)=>{
    // Input: req.body: { name, type, size, owner, folder, url, tags } & Output: saved file

    //1. Extract file details from req.body.
    //2. Validate required fields.
    //3. Create a new File document.
    //4. Save to DB.
    //5. Return saved file as response.

    const {name, type, size, owner, folder, tags} = req.body

    if([name, owner, folder].some((field)=>!field || field.trim() === "")){
        throw new ApiError(400, "All fields required.")
    }

    const fileExists = await File.findOne({name:name, owner:owner, folder:folder})

    if(fileExists){
        throw new ApiError(400, "File with the same name already exists.")
    }

    const urlLocalPath = req.file?.path

    if (!urlLocalPath) {
        throw new ApiError(400, "File is required")
    }

    const url = await uploadOnCloudinary(urlLocalPath)

    if(!url.url || !url.public_id){
        throw new ApiError(400, "Error while uploading on file")
    }

    const createFile = await File.create({
        name: name,
        type: type,
        size: size,
        owner: owner,
        folder: folder,
        url: url.url,
        public_id: url.public_id,
        tags: tags
    })

    const uploadedFile = await File.findById(createFile._id).select("name type size owner folder")

    if(!uploadedFile){
        throw new ApiError(500, "File upload unsuccessful.")
    }

    return res.status(200).json(new ApiResponse(200, uploadedFile, "File uploaded successfully."))
})

const getFileById = asyncHandler(async(req,res)=>{
    // Input: req.params.fileId & Output: File object

    //1. Extract fileId from req.params.
    //2. Validate it.
    //3. Use File.findById(fileId).
    //4. If not found, throw 404.
    //5. Else, return file.

    const fileId = req.params.fileId

    if(!fileId){
        throw new ApiError(400, "Invalid field Id.")
    }

    const file = await File.findById(fileId)

    if(!file){
        throw new ApiError(404, "File not found.")
    }

    return res.status(200).json(new ApiResponse(200, file, "File extracted successfully."))
})

const updateFile = asyncHandler(async(req,res)=>{

    // Input: req.params.fileId, req.body (any fields to update) & Output: Updated file

    //1. Extract fileId and updateData from req.
    //2. Use File.findByIdAndUpdate(fileId, updateData, { new: true }).
    //3. Return updated file.

    const {fileId} = req.params

    const {name, tags} = req.body

    if(!fileId || fileId.trim()===""){
        throw new ApiError(400, "Invalid file Id.")
    }

   if(!name || name.trim()===""){
        throw new ApiError(400, "Invalid name.")
    }

    if(!Array.isArray(tags) || tags.length === 0){
        throw new ApiError(400, "Invalid tag array.")
    }

    const updatedFile = await File.findByIdAndUpdate(fileId,{
        name:name.trim(),
        tags:tags
    },{
        new:true,
        runValidators:true
    })

    if(!updatedFile){
        throw new ApiError(400, "File not updated.")
    }

    return res.status(200).json(new ApiResponse(200, updatedFile, "File updated successfully."))
    })

const deleteFile = asyncHandler(async(req,res)=>{

    // Input: req.params.fileId & Output: Success message

    //1. Extract fileId from req.params.
    //2. Find and delete file using File.findByIdAndDelete.
    //3. If needed, also remove from cloud (via URL).
    //4. Return confirmation.

    const {fileId} = req.params

    if(!fileId){
        throw new ApiError(400, "Invalid file Id.")
    }

    const deletedFile = await File.findByIdAndDelete(fileId)

    if(!deletedFile){
        throw new ApiError(404,"File not found or already deleted.")
    }

    const public_id = deletedFile.public_id

    if (public_id){
        await deleteFromCloudinary(public_id)
    }

    return res.status(200).json(new ApiResponse(200, deletedFile, "File deleted successfully."))
})

const getFilesByFolder = asyncHandler(async(req,res)=>{

    // Input: req.params.folderId & Output: Array of files

    //1. Extract folderId from req.params.
    //2. Use File.find({ folder: folderId }).
    //3. Return files.

    const {folderId} = req.params

    if(!folderId){
        throw new ApiError(400, "Invalid Folder Id.")
    }

    const files = await File.find({folder:folderId})

    if(!files || files.length === 0){
        throw new ApiError(404, "No files found in the folder.")
    }

    return res.status(200).json(new ApiResponse(200, files, "Files retrieved successfully."))

})

const getFilesByOwner = asyncHandler(async(req,res)=>{
    // Input: req.params.ownerId & Output: Array of files

    //1. Extract ownerId from req.params.
    //2. Use File.find({ owner: ownerId }).
    //3. Return files.

    const {ownerId} = req.params

    if(!ownerId){
        throw new ApiError(400, "Owner's Id not provided.")
    }

    const ownerFiles = await File.find({owner:ownerId})

    if(!ownerFiles || ownerFiles.length === 0){
        return res.status(200).json(new ApiResponse(200, [], "Matching files returned successfully."))
    }

    return res.status(200).json(new ApiResponse(200, ownerFiles, "Matching files returned successfully."))
})

const searchFilesByTagName = asyncHandler(async(req,res)=>{
    // Input: req.query.searchText (search text) & Output: Array of files matching by tag

    //1. Extract searchText from query.
    //2. Use regex in File.find({ tags: /q/i })
    //3. Return matching files.

    const {searchTag} = req.params

    if(!searchTag){
        throw new ApiError(400, "Searching text not found.")
    }

    const regex = new RegExp(searchTag, "i")

    const searchedFiles = await File.find({
        tags:{
            $regex: regex
        }
    })

    if(!searchedFiles || searchedFiles.length === 0){
        throw new ApiError(404, "Matching files not found.")
    }

    return res.status(200).json(new ApiResponse(200, searchedFiles, "Matching files returned successfully."))
})

const searchFilesByFileName = asyncHandler(async(req,res)=>{
    // Input: req.query.searchText (search text) & Output: Array of files matching by name

    //1. Extract searchText from query.
    //2. Use regex in File.find({ name: /q/i })
    //3. Return matching files.

    const {searchText} = req.params

    if(!searchText){
        throw new ApiError(400, "Searching text not found.")
    }

    const regex = new RegExp(searchText, "i")

    const searchedFiles = await File.find({
        name: regex
    })

    if(!searchedFiles || searchedFiles.length === 0){
        throw new ApiError(404, "Matching files not found.")
    }

    return res.status(200).json(new ApiResponse(200, searchedFiles, "Matching files returned successfully."))
})

const filterFilesByType = asyncHandler(async(req,res)=>{
    // Input: req.query.type & Output: Files of a specific type

    //1. Extract type (image, video, document) from query.
    //2. Validate against allowed types.
    //3. Use File.find({ type }).
    //4. Return files.

    const {type} = req.params

    const allowedTypes = ["image","video","document"]
    
    if(!type || !allowedTypes.includes(type)){
        throw new ApiError(400, "Invalid type given.")
    }

    const filteredFiles = await File.find({type: type}).sort({createdAt : -1})

    if(filteredFiles.length === 0){
        return res.status(204).json(new ApiResponse(204, [], "No files found for this filter."))
    }

    return res.status(200).json(new ApiResponse(200, filteredFiles, "Files found for the filter successfully."))
})

const filterFilesBySizeRange = asyncHandler(async(req,res)=>{
    // Input: req.query.minSize, req.query.maxSize & Output: Files within size range

    //1. Extract minSize and maxSize.
    //2. Use File.find({ size: { $gte: minSize, $lte: maxSize } }).
    //3. Return files.

    const {minsize, maxsize} = req.body

    if(Number.isNaN(minsize) || Number.isNaN(maxsize) || minsize < 0 || maxsize < 0 || maxsize < minsize){
        throw new ApiError(400, "Send minimum and maximum range of file size.")
    }

    const filterBySizeRange = await File.find({
        size:{
            $gte: minsize,
            $lte : maxsize
        }
    }).sort({size: -1})

    return res.status(200).json(new ApiResponse(200, filterBySizeRange, "Files filtered successfully."))
})

    const bulkDeleteFiles = asyncHandler(async(req,res)=>{
        // Input: req.body.fileIds (array) & Output: Confirmation

        //1. Extract array of fileIds.
        //2. Use File.deleteMany({ _id: { $in: fileIds } }).
        //3. Return success message. 
        
        const {fileIds} = req.body
        

        if(!fileIds || !Array.isArray(fileIds) || fileIds.length === 0){
            throw new ApiError(400, "Invalid File Ids.")
        }

        const files = await File.find({
             _id: {
                $in: fileIds
            }
        })

        if(files.length === 0){
            throw new ApiError(400, "No files found to delete.")
        }

        const filesDeleted = await File.deleteMany({
            _id: {
                $in: fileIds
            }
        })

        if(filesDeleted.deletedCount === 0){
            throw new ApiError(400, "Unsuccessful to delete files.")
        }

        for(const fileId of files){
            const public_id = fileId.public_id
            if(public_id){
                await deleteFromCloudinary(public_id)
            }
        }

        return res.status(200).json(new ApiResponse(200, filesDeleted, "Files Deleted Successfully."))

    })

const moveFilesToFolder = asyncHandler(async(req,res) =>{
    // Input: req.body.fileIds, req.body.newFolderId & Output: Updated files

    //1. Extract fileIds and newFolderId.
    //2. Use File.updateMany({ _id: { $in: fileIds } }, { folder: newFolderId }).
    //3. Return success.

    const {fileIds} = req.body

    const {newFolderId} = req.body

    if(!fileIds || !Array.isArray(fileIds)){
        throw new ApiError(400, "Invalid File Id") //File Ids must be an array.
    }

    if(!newFolderId){
        throw new ApiError(400, "Invalid Folder Id.")
    }

    const movedFilesToNewFolder = await File.updateMany({
        _id: {
            $in: fileIds
        }
    },{
        folder:newFolderId
    })

    if(movedFilesToNewFolder.modifiedCount === 0){
        throw new ApiError(404, "No files were moved.")
    }

    return res.status(200).json(new ApiResponse(200, movedFilesToNewFolder, "Files moved to new folder successfully"))
})

const addTagsToFile = asyncHandler(async (req,res) => {
    // Input: req.params.fileId, req.body.tags & Output: Updated file

    //1. Extract fileId and tags array.
    //2. Use File.findByIdAndUpdate(fileId, { $addToSet: { tags: { $each: tags } } }, { new: true }).
    //3. Return updated file.

    const {fileId} = req.params

    const {tags} = req.body

    if(!fileId){
        throw new ApiError(404,"Invalid File Id.")
    }

    if(!Array.isArray(tags) || tags.length === 0){
        throw new ApiError(400, "Tags must be a non-empty array.")
    }

    const tagAddedFile = await File.findByIdAndUpdate(fileId,{
        $addToSet:{
            tags: {
                $each: tags
            }
        }
    },{
        new:true,
        runValidators:true
    })

    if(!tagAddedFile){
        throw new ApiError(404, "File not found!")
    }

    return res.status(200).json(new ApiResponse(200 ,tagAddedFile, "Tags added to the file successfully."))
})

const removeTagsFromFile = asyncHandler(async(req,res)=> {
    // Input: req.params.fileId & Output: Updated file

    //1. Extract fileId and tags array.
    //2. Use File.findByIdAndUpdate(fileId, { $pullAll: { tags } }, { new: true }).
    //3. Return updated file.

    const {fileId} = req.params

    const {tags} = req.body

    if(!fileId){
        throw new ApiError(400,"Invalid File Id.")
    }

    if (!Array.isArray(tags) || tags.length === 0) {
        throw new ApiError(400, "Tags must be a non-empty array.")
    }

    const tagRemovedFile = await File.findByIdAndUpdate(fileId,{
        $pullAll:{ tags }
    },
    {
        new:true,
        runValidators:true
    })

    if(!tagRemovedFile){
        throw new ApiError(404,"File not found!" )
    }

    return res.status(200).json(new ApiResponse(200 ,tagRemovedFile, "Tags removed from the file successfully."))
})

export {
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
}