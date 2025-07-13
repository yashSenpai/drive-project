import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const deleteFromCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath){
            return null
        }else{
            const response = await cloudinary.uploader.destroy(localFilePath)
             console.log('Cloudinary deletion result:', response);
             return response
        }
    } catch (error) {
        console.error("Error while deleting the file from cloudinary.", error)
        throw error
    }
}