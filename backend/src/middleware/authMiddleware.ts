import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
    email: string;
  };
}

/**
 * Authentication — verifies the token is genuine and attaches the real
 * decoded user (with their real role) to the request.
 *
 * FIX: the previous version forced role: 'admin' on every valid token,
 * and on a verification failure it still logged the request in as a
 * static admin account instead of rejecting it. Both of those defeated
 * authorization entirely — every request was treated as an admin, valid
 * token or not. This version fails closed: no valid token -> 401, full stop.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'no_token' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    const decoded = jwt.verify(token, secret) as AuthenticatedRequest['user'];

    if (!decoded || !decoded.userId || !decoded.role) {
      return res.status(401).json({ success: false, error: 'invalid_token' });
    }

    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'invalid_token' });
  }
}

/**
 * Authorization — runs AFTER requireAuth. Checks that the already-verified
 * user's role is one of the allowed roles for this route. Role comparison
 * is case-insensitive since roles have been written as both "Admin" and
 * "admin" in different parts of this codebase.
 */
export function requireRole(...allowedRoles: string[]) {
  const allowedLower = allowedRoles.map((r) => r.toLowerCase());

  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      return res.status(401).json({ success: false, error: 'no_auth' });
    }

    if (!allowedLower.includes(user.role.toLowerCase())) {
      return res.status(403).json({ success: false, error: 'forbidden' });
    }

    next();
  };
}