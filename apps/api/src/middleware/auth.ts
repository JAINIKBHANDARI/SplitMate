import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../lib/errors.js';
import { verifyAccess } from '../services/auth.service.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try { const token = req.cookies.sm_access; if (!token) throw new AppError(401, 'Please sign in to continue.', 'UNAUTHORIZED'); const claims = verifyAccess(token); if (!claims.sub) throw new Error('No subject'); req.auth = { userId: claims.sub, claims }; next(); } catch { next(new AppError(401, 'Your session has expired. Please sign in again.', 'UNAUTHORIZED')); }
}
export function csrfGuard(req: Request, _res: Response, next: NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.get('origin');
  if (origin && origin !== process.env.CLIENT_ORIGIN && !(process.env.NODE_ENV !== 'production' && origin === 'http://localhost:5173')) return next(new AppError(403, 'Invalid request origin.', 'CSRF_REJECTED'));
  next();
}
