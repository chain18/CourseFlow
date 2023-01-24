import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

const cloudinaryUpload = async (file, action, nameFolder, fileType) => {
  try {
    if (/upload/i.test(action)) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `courseflow/${nameFolder}`,
        type: "private",
        resource_type: "auto",
      });
      await fs.unlink(file.path);
      return { url: result.secure_url, public_id: result.public_id };
    } else if (/delete/i.test(action)) {
      if (/image/i.test(file)) {
        await cloudinary.uploader.destroy(file, {
          type: "private",
        });
      } else if (/video/i.test(file)) {
        await cloudinary.uploader.destroy(file, {
          type: "private",
          resource_type: "video",
        });
      } else if (/file/i.test(file)) {
        if (/image|pdf/i.test(fileType)) {
          await cloudinary.uploader.destroy(file, {
            type: "private",
          });
        } else if (/video/i.test(fileType)) {
          await cloudinary.uploader.destroy(file, {
            type: "private",
            resource_type: "video",
          });
        } else {
          await cloudinary.uploader.destroy(file, {
            type: "private",
            resource_type: "raw",
          });
        }
      }
    }
  } catch (error) {
    console.log("Error from uploading/ deleting:", error);
  }
};

export { cloudinaryUpload };
