import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import type { Request } from 'express';

import type { AuthenticatedRequest } from './authMiddleware.js';
import { AI_ERROR_CODES } from '../types/ai.js';

/**
 * حد أشد خاص بمسارات الـ AI فقط — كل طلب يكلّف فلوس حقيقية، مو وقت سيرفر بس
 * (Handbook Ch. 11.1). يحد لكل مستخدم (مو لكل IP) عشان يكون دقيق.
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // دقيقة وحدة
  max: 10, // 10 طلبات AI لكل مستخدم بالدقيقة
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const user = (req as AuthenticatedRequest).user;
    return user?.id || user?.userId || ipKeyGenerator(req.ip || 'unknown');
  },
  handler: (_req, res) => {
    res.status(429).json({ success: false, error: AI_ERROR_CODES.RATE_LIMITED });
  },
});
