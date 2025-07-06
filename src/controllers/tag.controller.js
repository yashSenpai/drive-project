import { ApiError } from "../utils/ApiError.js";
import { Tag } from "../models/tag.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createTag = asyncHandler(async(req,res)=>{
    //Extract name and optionally usedBy from req.body.
    //Validate that name is provided.
    //Create a new Tag document using the extracted values.
    //Save the document to the database.
    //Return the newly created tag as a JSON response.

    const {name, usedBy} = req.body

    if(!name || name.trim()===""){
        throw new ApiError(400, "Invalid Tag Name.")
    }

    if(!usedBy || usedBy.trim()===""){
        throw new ApiError(400, "Invalid User Name.")
    }

    const createdTag = await Tag.create({
        name:name,
        usedBy:usedBy
    })

    if(!createdTag){
            throw new ApiError(400, "Tag creation unsuccessful.")
    }

    return res.status(201).json(new ApiResponse(201, createdTag, "Tag creation successful."))
})

const getAllTags = asyncHandler(async(req,res)=>{
    //Query the Tag collection without any filters (Tag.find({})).
    //Optionally populate usedBy if you want user details.
    //Return the array of tags.
    
    const tagCollection = await Tag.find({}).populate("usedBy")

    if(tagCollection.length === 0){
        return res.status(200).json(new ApiResponse(204, [], "No tags found."))
    }

    return res.status(200).json(new ApiResponse(200, tagCollection, "Tag collection extracted successfully."))
})

const getTagById = asyncHandler(async(req,res)=>{
    //Extract tagId from req.params.
    //Validate the presence and format of tagId.
    //Use Tag.findById(tagId) to retrieve the document.
    //If not found, return a 404 error.
    //Else, return the tag object.

    const {tagId} = req.params

    if(!tagId || tagId.trim() === ""){
        throw new ApiError(400, "Invalid tag Id.")
    }

    const tagUser = await Tag.findById(tagId)

    if(!tagUser){
        return res.status(204).json(new ApiResponse(204, {}, "No tags found for the user."))
    }

     return res.status(200).json(new ApiResponse(200, tagUser, "Tags found for the user successfully."))

})

const updateTagById = asyncHandler(async(req,res)=>{
    //Extract tagId from req.params.
    //Extract fields to update from req.body (e.g., name).
    //Use Tag.findByIdAndUpdate(tagId, updates, { new: true }).
    //If no tag found, return a 404.
    //Else, return the updated tag.

    const {tagId} = req.params

    const {name} = req.body

    if(!tagId || tagId.trim()===""){
        throw new ApiError(400, "Invalid Tag Id.")
    }

    if(!name || name.trim() === ""){
        throw new ApiError(400, "Need new data to update.")
    }

    const updatedTag = await Tag.findByIdAndUpdate(tagId, { name: name.trim() },{
        new:true,
        runValidators:true
    })

    if(!updatedTag){
        throw new ApiError(404, "Tag update unsuccessful.")
    }

    return res.status(200).json(new ApiResponse(200, updatedTag, "Tag updated successfully."))
})

const deleteTagById = asyncHandler(async(req,res)=>{
    //Extract tagId from req.params.
    //Use Tag.findByIdAndDelete(tagId).
    //If no tag found, return a 404.
    //Else, return success message or deleted tag.

    const {tagId} = req.params

    if(!tagId || tagId.trim()===""){
        throw new ApiError(400, "Invalid Tag Id.")
    }

    const deletedTag = await Tag.findByIdAndDelete(tagId)

    if(!deletedTag){
        throw new ApiError(404, "Tag deletion unsuccessful.")
    }

    return res.status(200).json(new ApiResponse(200, deletedTag, "Tag deleted successfully."))
})

const getTagsByUser = asyncHandler(async(req,res)=>{
    //Extract userId from req.params.
    //Use Tag.find({ usedBy: userId }).
    //Return the array of tags used by that user.

    const {userId} = req.params

    if(!userId || userId.trim()===""){
        throw new ApiError(400, "Invalid User Id.")
    }

    const tags = await Tag.find({usedBy: userId})

    if(!tags || tags.length === 0){
        return res.status(200).json(new ApiResponse(200, [], "No tags found for this user."))
    }

    return res.status(200).json(new ApiResponse(200, tags, "Tags found for this user successfully."))
})

const searchTagsByName = asyncHandler(async(req,res)=>{
    //Extract searchTerm from req.query.
    //Use a regex query like: Tag.find({ name: { $regex: searchTerm, $options: "i" } })
    //Return matched tags.

    const {searchTerm} = req.query

    if(typeof searchTerm !== "string" || !searchTerm || searchTerm.trim() === ""){
        throw new ApiError(400, "Invalid search term.")
    }

    const regex = new RegExp(searchTerm, "i")

    const termFound = await Tag.find({name: regex}).sort({createdAt: -1})

    if(termFound.length === 0){
        return res.status(204).json(new ApiResponse(204, [], "Tags not found in database."))
    }

    return res.status(200).json(new ApiResponse(200, termFound, "Tags found successfully."))
})

export {
    createTag,
    getAllTags,
    getTagById,
    updateTagById,
    deleteTagById,
    getTagsByUser,
    searchTagsByName
}