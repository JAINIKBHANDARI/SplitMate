import { Router } from "express";
import * as auth from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signUpSchema,
} from "../validators/schemas.js";
export const authRouter = Router();
authRouter.post("/signup", validate(signUpSchema), auth.signUp);
authRouter.post("/login", validate(loginSchema), auth.login);
authRouter.post("/refresh", auth.refresh);
authRouter.post("/logout", auth.logout);
authRouter.post("/logout-all", requireAuth, auth.logoutAll);
authRouter.get("/me", requireAuth, auth.me);
authRouter.post(
  "/change-password",
  requireAuth,
  validate(changePasswordSchema),
  auth.changePassword,
);
authRouter.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  auth.forgotPassword,
);
authRouter.post(
  "/reset-password",
  validate(resetPasswordSchema),
  auth.resetPassword,
);
