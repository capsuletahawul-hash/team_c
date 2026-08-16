import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
    email: string;
  };
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'no_token' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    const decoded = jwt.verify(token, secret) as { userId: string; role: string; email: string };
    
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'invalid_token' });
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'no_auth' });
    }

    // مطابقة الـ Role بدون حساسية للأحرف الكبيرة/الصغيرة
    const userRole = user.role.toUpperCase();
    const hasRole = allowedRoles.some((r) => r.toUpperCase() === userRole);

    if (!hasRole) {
      return res.status(403).json({ success: false, error: 'forbidden' });
    }

    next();
  };
}