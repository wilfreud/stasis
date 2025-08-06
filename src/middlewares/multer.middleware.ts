import multer from "multer";
import { Request } from "express";

/**
 * Configure memory storage for uploaded template files
 * Using memory storage to process file content before saving
 */
const storage = multer.memoryStorage();

/**
 * File filter function to validate Handlebars template file types
 */
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback,
): void => {
  // Accept only .hbs and .handlebars file extensions
  if (
    file.originalname.endsWith(".hbs") ||
    file.originalname.endsWith(".handlebars")
  ) {
    callback(null, true);
  } else {
    callback(new Error("Only .hbs and .handlebars files are allowed"));
  }
};

/**
 * Multer instance configured for Handlebars template uploads
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max file size
  },
});

/**
 * Multer instance configured for bulk Handlebars template uploads
 * Supports up to 20 files simultaneously
 */
export const uploadBulk = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max file size per file
    files: 20, // Maximum 20 files per request
  },
});
