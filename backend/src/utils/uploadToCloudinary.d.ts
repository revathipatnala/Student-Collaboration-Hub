// utils/uploadToCloudinary.ts
import cloudinary from './cloudinary.js';

const uploadToCloudinary = (file: Express.Multer.File, folder = 'uploads'): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        public_id: Date.now() + '-' + file.originalname,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(file.buffer);
  });
};

export default uploadToCloudinary;
