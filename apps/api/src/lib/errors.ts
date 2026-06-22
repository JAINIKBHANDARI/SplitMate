import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { isProduction } from "../config/env.js";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code = "REQUEST_ERROR",
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
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof ZodError)
    return res
      .status(422)
      .json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Please check the highlighted fields.",
          details: error.flatten(),
        },
      });
  if (error instanceof AppError)
    return res
      .status(error.statusCode)
      .json({ error: { code: error.code, message: error.message } });
  if ((error as { code?: number }).code === 11000)
    return res
      .status(409)
      .json({
        error: { code: "DUPLICATE", message: "That record already exists." },
      });
  console.error(error);
  return res
    .status(500)
    .json({
      error: {
        code: "INTERNAL_ERROR",
        message: isProduction
          ? "Something went wrong."
          : (error as Error).message,
      },
    });
}
