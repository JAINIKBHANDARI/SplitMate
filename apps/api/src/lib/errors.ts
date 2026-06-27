import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { isProduction } from "../config/env.js";

export type FieldError = { field: string; message: string };

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code = "REQUEST_ERROR",
    public errors: FieldError[] = [],
  ) {
    super(message);
  }
}
export const asyncHandler =
  <T extends Request>(
    fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>,
  ) =>
  (req: T, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  code: string,
  errors: FieldError[] = [],
) =>
  res.status(statusCode).json({
    success: false,
    message,
    errors,
    error: { code, message, errors },
  });

const zodErrors = (error: ZodError): FieldError[] =>
  error.issues.map((issue) => ({
    field: issue.path.join(".") || "form",
    message: issue.message,
  }));

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof ZodError)
    return sendError(
      res,
      422,
      "Validation failed",
      "VALIDATION_ERROR",
      zodErrors(error),
    );
  if (error instanceof AppError)
    return sendError(
      res,
      error.statusCode,
      error.message,
      error.code,
      error.errors,
    );
  if ((error as { code?: number }).code === 11000)
  {
    const field = Object.keys((error as any).keyPattern ?? {})[0] ?? "form";
    return sendError(
      res,
      409,
      field === "email"
        ? "An account with this email already exists."
        : "That record already exists.",
      "DUPLICATE",
      [
        {
          field,
          message:
            field === "email"
              ? "This email is already registered."
              : "This value is already in use.",
        },
      ],
    );
  }
  if ((error as { name?: string }).name === "ValidationError") {
    const entries = Object.entries((error as any).errors ?? {});
    return sendError(
      res,
      422,
      "Validation failed",
      "VALIDATION_ERROR",
      entries.map(([field, value]: [string, any]) => ({
        field,
        message: value.message ?? "This field is invalid.",
      })),
    );
  }
  if ((error as { name?: string }).name === "CastError")
    return sendError(res, 404, "Resource not found.", "NOT_FOUND");
  if ((error as { name?: string }).name === "TokenExpiredError")
    return sendError(res, 401, "Session expired.", "UNAUTHORIZED");
  if ((error as { name?: string }).name === "JsonWebTokenError")
    return sendError(res, 401, "Invalid session.", "UNAUTHORIZED");
  console.error(error);
  return sendError(
    res,
    500,
    isProduction ? "Something went wrong." : (error as Error).message,
    "INTERNAL_ERROR",
  );
}
