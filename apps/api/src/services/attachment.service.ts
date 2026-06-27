import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";
import { AppError } from "../lib/errors.js";

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export function assertUploadable(file?: Express.Multer.File) {
  if (!file) throw new AppError(422, "Choose a file to upload.", "NO_FILE");
  if (!allowedTypes.has(file.mimetype))
    throw new AppError(
      422,
      "Receipts must be JPG, PNG, WebP, or PDF.",
      "UNSUPPORTED_FILE",
    );
  if (file.size > 5 * 1024 * 1024)
    throw new AppError(413, "File size must be 5 MB or less.", "FILE_TOO_BIG");
}

export async function uploadAttachment(file: Express.Multer.File, folder: string) {
  assertUploadable(file);
  if (
    !env.CLOUDINARY_CLOUD_NAME ||
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET
  )
    throw new AppError(
      503,
      "Receipt upload is disabled until Cloudinary is configured.",
      "UPLOAD_DISABLED",
    );
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  return cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: file.mimetype === "application/pdf" ? "raw" : "image",
    use_filename: false,
    unique_filename: true,
  });
}

export async function deleteAttachment(publicId: string, mimeType: string) {
  if (
    !env.CLOUDINARY_CLOUD_NAME ||
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET
  )
    return;
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  await cloudinary.uploader.destroy(publicId, {
    resource_type: mimeType === "application/pdf" ? "raw" : "image",
  });
}
