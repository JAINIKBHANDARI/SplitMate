import type { JwtPayload } from "jsonwebtoken";
declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string; claims: JwtPayload };
      user?: { id: string; name: string; email: string };
    }
  }
}
export {};
