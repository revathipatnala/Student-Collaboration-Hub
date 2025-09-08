// Helper to upload an image file to Cloudinary
import cloudinary from "./cloudinary.js";

const uploadToCloudinary = (file, folder = "uploads") => {
  return new Promise((resolve, reject) => {
    if (typeof file === "string") {
      // file path
      cloudinary.uploader.upload(
        file,
        { folder, resource_type: "auto" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    } else if (file && file.buffer && file.originalname) {
      // file is multer file object with buffer
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
          public_id: Date.now() + "-" + file.originalname,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      stream.end(file.buffer); // push buffer to Cloudinary
    } else {
      reject(new Error("Invalid file input for Cloudinary upload"));
    }
  });
};

export default uploadToCloudinary;
