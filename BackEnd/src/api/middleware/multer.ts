import "dotenv/config";
import multer from "multer";
import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// cloudinary config
export const cloudinaryLib = cloudinary.v2;
cloudinaryLib.config({
  cloud_name: process.env.CLOUDINARY_CLOUDNAME as string,
  api_key: process.env.CLOUDINARY_APIKEY as string,
  api_secret: process.env.CLOUDINARY_APISECRET as string,
});

// <setup multer storage to cloudinary>
// profile image upload
const profileImageStorage = new CloudinaryStorage({
  cloudinary: cloudinaryLib,
  params: async (req, file) => {
    return {
      folder: "profile_picture",
      public_id: "user-profile_" + (req.user as any).id,
    };
  },
});
const uploadProfileImage = multer({
  storage: profileImageStorage,
  fileFilter(req, file, callback) {
    //allowed only jpeg and png images to be uploaded
    const allowedMimeTypes = ["image/jpeg", "image/png"];

    if (allowedMimeTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 3, //3 Mb
  },
});

// upload membership proof
const membershipImageStorage = new CloudinaryStorage({
  cloudinary: cloudinaryLib,
  params: async (req, file) => {
    return {
      folder: "membership_proof",
      public_id: Date.now() + "_user_memberproof",
    };
  },
});
const uploadMembershipProofImage = multer({
  storage: membershipImageStorage,
  fileFilter(req, file, callback) {
    //allowed only jpeg and png images to be uploaded
    const allowedMimeTypes = ["image/jpeg", "image/png"];

    if (allowedMimeTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5, //5 Mb
  },
});

// vtuber icon image upload
const vtuberIconImageStorage = new CloudinaryStorage({
  cloudinary: cloudinaryLib,
  params: async (req, file) => {
    return {
      folder: "vtuber_picture",
      public_id: req.params.id + "_vtuber-icon",
    };
  },
});
const uploadVtuberIconImage = multer({
  storage: vtuberIconImageStorage,
  fileFilter(req, file, callback) {
    //allowed only jpeg and png images to be uploaded
    const allowedMimeTypes = ["image/jpeg", "image/png"];

    if (allowedMimeTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 9, //9 Mb
  },
});

// vtuber port image upload
const vtuberPortImageStorage = new CloudinaryStorage({
  cloudinary: cloudinaryLib,
  params: async (req, file) => {
    return {
      folder: "vtuber_picture",
      public_id: req.params.id + "_vtuber-port",
    };
  },
});
const uploadVtuberPortImage = multer({
  storage: vtuberPortImageStorage,
  fileFilter(req, file, callback) {
    //allowed only jpeg and png images to be uploaded
    const allowedMimeTypes = ["image/jpeg", "image/png"];

    if (allowedMimeTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 10, //10 Mb Cloudinary limit
  },
});

export {
  uploadProfileImage,
  uploadVtuberIconImage,
  uploadVtuberPortImage,
  uploadMembershipProofImage,
};
