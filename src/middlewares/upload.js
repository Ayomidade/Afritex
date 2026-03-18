import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

/*
PROFILE IMAGE STORAGE
*/

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "afritex/users",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

/*
PRODUCT IMAGE STORAGE
*/

const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "afritex/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
  },
});

export const uploadProfileImage = multer({
  storage: profileStorage,
}).single("profileImage");

export const uploadProductImages = multer({
  storage: productStorage,
}).array("productImages", 5);
