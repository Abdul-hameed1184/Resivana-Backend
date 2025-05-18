import cloudinary from "../lib/cloudinary.js";

export const messageMediaUpload = async (req, res, next) => {
    try {
        const files = req.files;

        if (!files || files.length === 0) {
            // return res.status(400).json({ message: 'No files uploaded' });
            console.log("❌ No files received");
        }else{

          console.log("✅ Files received:", files.length);
          console.log("✅ Files received:", files);
          const uploadPromises = files.map((file) => {
            return new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                {
                  folder: "message-pics",
                  resource_type: file.mimetype.startsWith("video")
                    ? "video"
                    : "image",
                },
                (error, result) => {
                  if (error) {
                    console.error("❌ Cloudinary Upload Error:", error);
                    reject(error);
                  } else {
                    console.log(
                      "✅ Cloudinary Upload Successful:",
                      result.secure_url
                    );
                    resolve(result.secure_url);
                  }
                }
              );
      
              uploadStream.end(file.buffer);
            });
          });
          
          const uploadedUrls = await Promise.all(uploadPromises);

            req.body.media = uploadedUrls; 
            
    console.log("✅ Uploaded Images:", uploadedUrls);
        
    
  }
  console.log('passed')
    next();
  } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server error' });
    }
}


