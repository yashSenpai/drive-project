import { ApiError } from "../utils/ApiError.js";
import { Folder } from "../models/folder.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createFolder = asyncHandler(async(req,res)=>{
    //Goal: Create a new folder, optionally nested under a parent.

    //Extract name, owner, and optional parent ID from req.body.
    //Initialize path as an empty array.
    //If parent exists:
    //Fetch the parent folder.
    //If not found, return error.
    //Set path to [...parent.path, parent._id].
    //Create a new folder with name, owner, parent, and path.
    //Save and return the folder.

    const {name, parent} = req.body

    const owner = req.user._id
    
    if(!name || name.trim() === "" || !owner){
        throw new ApiError(400, "Name and Owner required.")
    }

    const folderExisted = await Folder.findOne({name})

    if(folderExisted){
        throw new ApiError(400, "Folder with the same name already exists.")
    }

    let path = []

    if(parent){
        const parentFolder = await Folder.findById(parent)

        if(!parentFolder){
            return res.status(404).json(new ApiResponse(404, {}, "No parent folder found."))
        }

        path = [...parentFolder.path,parentFolder._id]
    }

    const folder = await Folder.create({
        name:name,
        owner:owner,
        parent:parent||null,
        path:path
    })

    const createdFolder = await Folder.findById(folder._id)

    if(!createdFolder){
        throw new ApiError(400, "Folder creation unsuccessful.")
    }

    return res.status(201).json(new ApiResponse(201, createdFolder, "Folder created successfully."))
})

const getFolderById = asyncHandler(async(req,res)=>{
    //Goal: Get a single folder by its ID.

    //Extract folderId from req.params.
    //Find folder by _id.
    //If not found, return error.
    //Return folder.

    const {folderId} = req?.params

    if(!folderId){
        throw new ApiError(400, "Folder ID is required.")
    }

    const folder = await Folder.findById(folderId).populate("parent", "name").populate("path", "name").populate("owner", "name")

    if(!folder){
        throw new ApiError(400, "Folder not found.")
    }

    return res.status(200).json(new ApiResponse(200, folder, "Folder extracted successfully."))
})

const getUserFolders = asyncHandler(async(req,res)=>{
    //Goal: Get all top-level folders for a user.

    //Extract userId from req.params or req.user.
    //Find all folders where owner == userId and parent == null.
    //Return the list.

    const {userId} = req.params || req.body

    if(!userId){
        throw new ApiError(400, "User not found.")
    }

    const folderlist = await Folder.find({owner: userId, parent: null}).sort({createdAt:-1}).select("name updatedAt")

    return res.status(200).json(new ApiResponse(200, folderlist, "Folders of the user fetched successfully."))
})

const getFolderPath = asyncHandler(async(req,res)=>{
    //Goal: Return the full path of a folder (as a list of folder names or IDs).

    //Extract folderId from req.params.
    //Find the folder by ID.
    //If not found, return error.
    //Populate the path field to get full folder path.
    //Return populated path array.

    const {folderId} = req.params

    if(!folderId){
        throw new ApiError(400, "Folder Id is required.")
    }

    const folder = await Folder.findById(folderId).populate("path", "name")

    if(!folder){
        throw new ApiError(404, "Folder not found.")
    }

    return res.status(200).json(new ApiResponse(200, folder, "Folder path extracted successfully."))
})

const getFolderChildren = asyncHandler(async(req,res)=>{
    //Goal: Get direct children of a folder.

    //Extract folderId from req.params.
    //Find all folders where parent == folderId.
    //Return the list.

    const {folderId} = req.params

    if(!folderId){
        throw new ApiError(400, "Folder Id is required.")
    }

    const folderchildrenList = await Folder.find({parent:folderId}).sort({createdAt:-1}).select("name updatedAt")

    return res.status(200).json(new ApiResponse(200,folderchildrenList,"Folder's children fetched successfully."))
})

const getFolderTree = asyncHandler(async(req,res)=>{
    //Goal: Return full tree of folders under a root folder.

    //Extract folderId (root) from req.params.
    //Define a recursive function buildTree(parentId):
    //Find all folders where parent == parentId.
    //For each folder, recursively get its children.
    //Return each folder with children field.
    //Call buildTree(folderId) and return the result.

    const {folderId} = req.params

    async function buildTree (parentId) {
        
        const folderList = await Folder.find({parent:parentId}).select("_id name")

        let result =[]

        for (const folder of folderList){
            
            const children = await buildTree(folder._id)

            result.push({
                _id: folder._id,
                name: folder.name,
                children: children
            })
        }

        return result
    }

    const folderTree = await buildTree(folderId);

    return res.status(200).json(new ApiResponse(200,{folderTree}, "Folder Tree extracted successfully."))
})

const renameFolder = asyncHandler(async(req,res)=>{
    //Goal: Just change the folder's name.
    
    //Extract folderId and newName from req.body.
    //Find the folder.
    //If not found, return error.
    //Update folder.name = newName.
    //Save and return updated folder.

    const {folderId, name} = req.body

    if(!folderId || folderId.trim() === ""){
        throw new ApiError(400, "Folder ID is required.");
    }

    if(!name || name.trim() === ""){
        throw new ApiError(400, "New folder name is required.")
    }

    const folder = await Folder.findById(folderId)

    if(!folder){
        throw new ApiError(404, "Folder not found")
    }

    if(folder.name === name){
        return res.status(200).json(new ApiResponse(200, folder, "Folder name is already the same."))
    }

    const renamedFolder = await Folder.findByIdAndUpdate(folderId, {
        $set:{name:name}
    },{
        new:true,
        runValidators:true
    })

    return res.status(200).json(new ApiResponse(200, renamedFolder, "Folder renamed successfully."))
})

const moveFolder = asyncHandler(async(req,res)=>{
    //Goal: Move a folder under a different path.

    //Extract folderId and newFolderPath from req.body.
    //Find the folder.
    //If folder not found, return error.
    //Update folder.parent = newParent._id.
    //Update folder.path = [...newParent.path, newParent._id].
    //Save and return the updated folder.
    
    const {folderId, newFolderPath} = req.body

    if(!folderId){
        throw new ApiError(400, "Folder Id is required.")
    }

    if(!newFolderPath || !Array.isArray(newFolderPath) || newFolderPath.length === 0){
        throw new ApiError(400, "New folder path is required.")
    }
    
    const folder = await Folder.findById(folderId)

    if(!folder){
        throw new ApiError(404, "Folder not found.")
    }

    const newParentId = newFolderPath[newFolderPath.length - 1]

    const newParent = await Folder.findById(newParentId)

    if(!newParent){
        throw new ApiError(404, "Target parent not found.")
    }

    if(folderId === newParentId || folder.path.includes(folderId)){
        throw new ApiError(400, "Invalid query: A folder cannot be moved into itself or its child.")
    }

    const moveFolder = await Folder.findByIdAndUpdate(folderId,{
        $set:{
            parent: newParent._id,
            path: [...newParent.path,newParent._id]
        }
    },{
        new:true,
        runValidators:true
    })

    return res.status(200).json(new ApiResponse(200, moveFolder, "Folder moved successfully."))
})

const deleteFolder = asyncHandler(async(req,res)=>{
    //Goal: Delete a folder.

    //Extract folderId from req.params.
    //Find and delete the folder by _id.
    //Optionally, also delete its children recursively if needed.
    //Return confirmation.

    const {folderId} = req.params

    if(!folderId){
        throw new ApiError(400, "Folder Id is required.")
    }

    const folder = await Folder.findById(folderId)

    if (!folder){
        throw new ApiError(404, "Folder not found.");
        }

    const deleteFolderRecursively = async (folderId) =>{

        const children = await Folder.find({ parent: folderId });
        for (const child of children){
            await deleteFolderRecursively(child._id)
        }

    await Folder.findByIdAndDelete(folderId)

    }

    await deleteFolderRecursively(folderId) //recursive folder and files deletion

    return res.status(200).json(new ApiResponse(200, {}, "Deleted folder successfully."))
})

export { 
    createFolder,
    getFolderById,
    getUserFolders,
    getFolderPath,
    getFolderChildren,
    getFolderTree,
    renameFolder,
    moveFolder,
    deleteFolder
}