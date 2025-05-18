import cloudinary from "../lib/cloudinary.js";

export const mediaUpload = async (req, res, next) => {
    try {
       const { title, description, price, location, type } = req.body;

       console.log(req.body.description, req.body.price, req.body.location, req.body.type, req.body.title)
       if (!title || !description || !price || !location || !type ) return res.status(400).json({ message: "Please fill in all fields here" });

        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const uploadPromises = files.map((file) => {
            return new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                {
                  folder: "property-new",
                  resource_type: file.mimetype.startsWith("video")
                    ? "video"
                    : "image",
                  chunk_size: 6000000,
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

            req.body.images = uploadedUrls; 
            
    console.log("✅ Uploaded Images:", uploadedUrls);
        

    console.log('passed 2')
        
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server error' });
    }
}


