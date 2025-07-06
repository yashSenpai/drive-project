import { ApiError } from "../utils/ApiError.js";
import { Activity } from "../models/activity.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { populate } from "dotenv";

const logActivity = asyncHandler(async(req,res)=>{
    //Goal: Create a new activity log when a user performs an action.

    //Receive user ID, action, and optionally file ID or folder ID from request body.
    //Validate required fields: user and action.
    //Validate that action is one of: upload, download, delete, move, rename.
    //Create a new Activity document with the given data.
    //Save to the database.
    //Return the saved activity object in the response.

    const {userId, action, fileId, folderId} = req.body

    if(!userId){
        throw new ApiError(400, "Invalid User ID.")
    }

    if(!['upload', 'download', 'delete', 'move', 'rename'].includes(action) || typeof action !== "string"){
        throw new ApiError(400, "Invalid Action.")
    }

    if (!fileId && !folderId){
        throw new ApiError(400, "Either fileId or folderId is required.");
    }

    const newActivity = {
        user: userId,
        action: action
    }

    if (typeof fileId === "string" && fileId.trim() !== ""){
        newActivity.file = fileId.trim();
    }

    if (typeof folderId === "string" && folderId.trim() !== ""){
        newActivity.folder = folderId.trim();
    }

    const activity = await Activity.create(newActivity)

    const createdActivity = await Activity.findById(activity._id) // populate can be used

    if(!createdActivity){
        throw new ApiError(400, "Activity not created.")
    }

    return res.status(200).json(new ApiResponse(200, createdActivity, "Activity created successfully."))
})

const getAllActivities = asyncHandler(async(req,res)=>{
    //Goal: Retrieve all activity logs (useful for admin).

    //Query the Activity collection with no filters.
    //Optionally populate user, file, and folder fields.
    //Sort results by createdAt in descending order.
    //Return the list of activities.
    
    const queryCollection = await Activity.find({}).populate("user").populate("file").populate("folder").sort({createdAt:-1})

    if(!queryCollection || queryCollection.length === 0){
        throw new ApiError(400, "Activities extraction unsuccessful.")
    }
    
    return res.status(200).json(new ApiResponse(200, queryCollection, "All activities received successfully"))
})

const getActivitiesByUser = asyncHandler(async(req,res)=>{
    //Goal: Retrieve all actions performed by a specific user.

    //Extract userId from request params.
    //Query Activity collection where user == userId.
    //Optionally populate file and folder.
    //Sort by createdAt descending.
    //Return the result.

    const userId = req.params.userId

    if(!userId || userId.trim() === ""){
        throw new ApiError(400, "Invalid user Id.")
    }

    const activities = await Activity.find({user:userId}).populate("file").populate("folder").sort({createdAt:-1})

    if(activities.length === 0){
        return res.status(200).json(new ApiResponse(200, "No actions found for this user."))
    }

    return res.status(200).json(new ApiResponse(200, activities, "Activities fetched successfully"))
})

const getActivitiesByFile = asyncHandler(async(req,res)=>{
    //Goal: Get activity logs related to a specific file.

    //Extract fileId from request params.
    //Query Activity collection where file == fileId.
    //Optionally populate user.
    //Sort by createdAt descending.
    //Return the result.

    const fileId = req.params.fileId

    if(!fileId || fileId.trim()===""){
        throw new ApiError(400, "Invalid File Id.")
    }
    
    const activities = await Activity.find({file:fileId}).populate("user").sort({createdAt: -1})

    if(activities.length === 0){
        return res.status(200).json(new ApiResponse(200, {},"No actions found for this file."))
    }
    
    return res.status(200).json(new ApiResponse(200, activities, "Actions fetched successfully."))
})

const getActivitiesByFolder = asyncHandler(async(req,res)=>{
    //Goal: Get activity logs related to a specific folder.

    //Extract folderId from request params.
    //Query Activity collection where folder == folderId.
    //Optionally populate user.
    //Sort by createdAt descending.
    //Return the result.

    const folderId = req.params.folderId

    if(!folderId){
        throw new ApiError(400, "Invalid Folder Id.")
    }

    const activities = await Activity.find({folder: folderId}).populate("user").sort({createdAt: -1})

    if(activities.length === 0){
        return res.status(200).json(new ApiResponse(200, [], "No actions found in this folder."))
    }

    return res.status(200).json(new ApiResponse(200, activities, "Actions fetched successfully."))
})

//The following apis are for future references.

const getRecentActivities = asyncHandler(async(req,res)=>{
    //Goal: Fetch the most recent N activity logs.

    //Define the number of activities to return (e.g., 10).
    //Query Activity collection with no filters.
    //Sort by createdAt descending.
    //Limit the result to N.
    //Populate user, file, and folder if needed.
    //Return the result.

    const fetchRecentActions = await Activity.find({}).sort({createdAt: -1}).limit(10).lean().populate("user").populate("folder").populate("file")

    if(fetchRecentActions.length === 0){
        return res.status(200).json(new ApiResponse(200,[], "No recent actions."))
    }

    return res.status(200).json(new ApiResponse(200,fetchRecentActions, "Recent actions fetched successfully."))    
})

export {
    logActivity,
    getAllActivities,
    getActivitiesByUser,
    getActivitiesByFile,
    getActivitiesByFolder,
    getRecentActivities
}