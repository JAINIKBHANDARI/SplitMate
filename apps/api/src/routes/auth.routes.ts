import { Router } from "express";
import { z } from "zod";
import * as auth from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, signUpSchema } from "../validators/schemas.js";
export const authRouter = Router();
authRouter.post("/signup", validate(signUpSchema), auth.signUp);
authRouter.post("/login", validate(loginSchema), auth.login);
authRouter.post("/refresh", auth.refresh);
authRouter.post("/logout", auth.logout);
authRouter.get("/me", requireAuth, auth.me);
authRouter.post(
  "/forgot-password",
  validate(z.object({ email: z.string().email() })),
  auth.forgotPassword,
);
authRouter.post(
  "/reset-password",
  validate(
    z.object({
      token: z.string().min(20),
      password: z.string().min(10).max(128),
    }),
  ),
  auth.resetPassword,
);
