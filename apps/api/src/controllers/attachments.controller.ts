import { Attachment } from "../models/Attachment.js";
import { Expense } from "../models/Expense.js";
import { Settlement } from "../models/Settlement.js";
import { AppError, asyncHandler } from "../lib/errors.js";
import { ok } from "../lib/http.js";
import { membershipFor } from "../services/access.service.js";
import { deleteAttachment, uploadAttachment } from "../services/attachment.service.js";
import { recordActivity } from "../services/activity.service.js";

async function resolveTarget(targetType: string, targetId: string) {
  if (targetType === "expense") {
    const expense = await Expense.findById(targetId);
    if (!expense) throw new AppError(404, "Expense not found.", "NOT_FOUND");
    return { groupId: String(expense.groupId), target: expense };
  }
  const settlement = await Settlement.findById(targetId);
  if (!settlement)
    throw new AppError(404, "Settlement not found.", "NOT_FOUND");
  return { groupId: String(settlement.groupId), target: settlement };
}

export const listAttachments = asyncHandler(async (req, res) => {
  const { groupId } = await resolveTarget(
    String(req.params.targetType),
    String(req.params.targetId),
  );
  await membershipFor(req, groupId);
  const attachments = await Attachment.find({
    targetType: String(req.params.targetType),
    targetId: String(req.params.targetId),
  })
    .populate("uploadedBy", "name avatarColor")
    .sort({ createdAt: -1 });
  ok(res, { attachments });
});

export const upload = asyncHandler(async (req, res) => {
  const targetType = String(req.params.targetType);
  const targetId = String(req.params.targetId);
  if (!["expense", "settlement"].includes(targetType))
    throw new AppError(404, "Attachment target not found.", "NOT_FOUND");
  const { groupId, target } = await resolveTarget(targetType, targetId);
  await membershipFor(req, groupId);
  const result = await uploadAttachment(req.file!, `splitmate/${groupId}`);
  const attachment = await Attachment.create({
    groupId,
    targetType,
    targetId,
    uploadedBy: req.auth!.userId,
    caption: req.body.caption,
    url: result.secure_url,
    publicId: result.public_id,
    originalName: req.file!.originalname,
    mimeType: req.file!.mimetype,
    size: req.file!.size,
  });
  if (targetType === "expense")
    await Expense.updateOne(
      { _id: target._id },
      { receiptAttachmentId: attachment._id, receiptUrl: attachment.url },
    );
  else
    await Settlement.updateOne(
      { _id: target._id },
      { proofAttachmentId: attachment._id },
    );
  await recordActivity(
    groupId,
    req.auth!.userId,
    targetType === "expense" ? "receipt.added" : "settlement.proof_added",
    targetType === "expense" ? "Added a receipt" : "Added payment proof",
    { attachmentId: String(attachment._id), targetId },
  );
  ok(res, { attachment }, 201);
});

export const remove = asyncHandler(async (req, res) => {
  const attachment = await Attachment.findById(String(req.params.attachmentId));
  if (!attachment)
    throw new AppError(404, "Attachment not found.", "NOT_FOUND");
  await membershipFor(req, String(attachment.groupId));
  await deleteAttachment(attachment.publicId, attachment.mimeType);
  await attachment.deleteOne();
  ok(res, { deleted: true });
});
