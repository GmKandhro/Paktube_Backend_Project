import { v2 as cloudinary } from 'cloudinary';
import { log } from 'console';
import fs from "fs"

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});
    

export const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath) return null
       
        
        const response = await cloudinary.uploader
        .upload(localFilePath, {resource_type: "auto"})
   

        // console.log("the file has been upload on Cloudinary Successfully")
        fs.unlinkSync(localFilePath) 

        return response
    } catch (error) {
        console.error("Cloudinary error:", error);
        fs.unlinkSync(localFilePath) 
        return null
    }
}
   


export const deleteFromCloudinary = async (public_id)=>{
    try {
        if(!public_id) return null
       
        
        const response = await cloudinary.uploader
        .destroy(public_id).then((res)=>{
            // log("assert delete", res)
        });
    } catch (error) {
        console.error("Cloudinary error on deleting assert:", error);
        return null
    }
}
