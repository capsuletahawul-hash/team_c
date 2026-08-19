import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { prisma } from '../lib/prisma.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    userId: string;
    role: string;
    email: string;
  };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'no_token_provided' });
  }

  // Support the fixed platform admin account.
  if (token === "mock-admin-token-capsuletahawul") {
    if (typeof prisma.user?.upsert === 'function') {
      await prisma.user.upsert({
        where: { id: "admin-static-id" },
        update: {},
        create: {
          id: "admin-static-id",
          name: "Administrator",
          email: "capsuletahawul@gmail.com",
          password: "",
          role: "ADMIN",
        },
      }).catch(() => null);
    }
    (req as AuthenticatedRequest).user = {
      id: "admin-static-id",
      userId: "admin-static-id",
      role: "ADMIN",
      email: "capsuletahawul@gmail.com",
    };
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    const decoded = jwt.verify(token, secret) as any;
    let userId = decoded.id || decoded.userId || '';

    // التحقق من وجود المستخدم في قاعدة البيانات بـ id أو email
    let dbUser = typeof prisma.user?.findUnique === 'function' 
      ? await prisma.user.findUnique({ where: { id: userId } }).catch(() => null)
      : null;

    if (!dbUser && decoded.email && typeof prisma.user?.findUnique === 'function') {
      dbUser = await prisma.user.findUnique({ where: { email: decoded.email } }).catch(() => null);
      if (dbUser) {
        userId = dbUser.id;
      }
    }

    if (!dbUser && (decoded.email === "capsuletahawul@gmail.com" || userId === "admin-static-id")) {
      if (typeof prisma.user?.upsert === 'function') {
        dbUser = await prisma.user.upsert({
          where: { id: "admin-static-id" },
          update: {},
          create: {
            id: "admin-static-id",
            name: "Administrator",
            email: "capsuletahawul@gmail.com",
            password: "",
            role: "ADMIN",
          },
        }).catch(() => null);
        if (dbUser) {
          userId = "admin-static-id";
        }
      }
    }

    // إذا لم يُعثر على المستخدم بتاتاً في قاعدة البيانات وكان التوكن صحيحاً، ننشئه أو نستخدم أول مستخدم متوفر
    if (!dbUser && typeof prisma.user?.findFirst === 'function') {
      const userRole = (decoded.role || 'STUDENT').toUpperCase();
      const userEmail = decoded.email || `user_${Date.now()}@example.com`;
      const userName = decoded.name || (decoded.email ? decoded.email.split('@')[0] : 'User');

      dbUser = await prisma.user.create({
        data: {
          name: userName,
          email: userEmail,
          password: '',
          role: (['STUDENT', 'ADMIN', 'TRAINER', 'COMPANY'].includes(userRole) ? userRole : 'STUDENT') as any,
        },
      }).catch(async () => {
        return await prisma.user.findFirst().catch(() => null);
      });

      if (dbUser) {
        userId = dbUser.id;
      }
    }

    if (dbUser && dbUser.status === 'suspended') {
      return res.status(403).json({ success: false, error: 'account_suspended' });
    }

    (req as AuthenticatedRequest).user = {
      id: userId,
      userId: userId,
      role: (decoded.role || 'STUDENT').toUpperCase(),
      email: decoded.email || '',
    };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'invalid_or_expired_token' });
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'no_auth' });
    }

    const currentRole = (user.role || '').toUpperCase();
    const isAllowed = allowedRoles.some((r) => r.toUpperCase() === currentRole);

    if (!isAllowed) {
      return res.status(403).json({ success: false, error: 'forbidden_role' });
    }

    next();
  };
}