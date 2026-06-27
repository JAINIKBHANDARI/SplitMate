import { Router } from "express";
import multer from "multer";
import * as attachments from "../controllers/attachments.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { attachmentCaptionSchema } from "../validators/schemas.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

export const attachmentsRouter = Router();
attachmentsRouter.use(requireAuth);
attachmentsRouter.get(
  "/:targetType/:targetId",
  attachments.listAttachments,
);
attachmentsRouter.post(
  "/:targetType/:targetId",
  upload.single("file"),
  validate(attachmentCaptionSchema),
  attachments.upload,
);
attachmentsRouter.delete("/:attachmentId", attachments.remove);
