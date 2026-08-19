import type { Request, Response, NextFunction } from 'express';

import type { AuthenticatedRequest } from './authMiddleware.js';
import { AI_ERROR_CODES } from '../types/ai.js';

/**
 * يمنع فاتورة مفاجئة (Handbook Ch. 10): كل مستخدم عنده سقف توكنز، يُرفض
 * أي طلب إضافي بمجرد ما يتجاوزه. تخزين بالذاكرة (Map) — نفس أسلوب
 * express-rate-limit الافتراضي من أسبوع 3، ما يحتاج جدول قاعدة بيانات.
 *
 * ملاحظة مهمة لبقية الفريق: عدد التوكنز الفعلي ما يُعرف إلا بعد رجوع رد
 * الـ AI (Handbook p.9) — فـ recordUsage() لازم تُستدعى من aiService.ts
 * بعد نجاح complete()، مو قبله. enforceCostCap هنا يتحقق من السقف قبل
 * الطلب فقط، ويعتمد على إن recordUsage تحدّث الرقم بعد كل استدعاء ناجح.
 */

const rawCap = Number(process.env.AI_USER_TOKEN_CAP);
const USER_TOKEN_CAP = Number.isFinite(rawCap) && rawCap >= 0 ? rawCap : 20000;

const usageByUser = new Map<string, number>();

function getUserId(req: Request): string {
  const user = (req as AuthenticatedRequest).user;
  return user?.id || user?.userId || 'unknown';
}

export function enforceCostCap(req: Request, res: Response, next: NextFunction) {
  const userId = getUserId(req);
  const used = usageByUser.get(userId) || 0;

  if (used >= USER_TOKEN_CAP) {
    return res.status(429).json({ success: false, error: AI_ERROR_CODES.COST_CAP_REACHED });
  }

  next();
}

/** يُستدعى بعد نجاح استدعاء complete() (من aiService.ts) بعدد التوكنز الفعلي لهذا الطلب */
export function recordUsage(userId: string, tokens: number) {
  const current = usageByUser.get(userId) || 0;
  usageByUser.set(userId, current + tokens);
}

/** يفيد الاختبار والتشخيص — يرجّع مجموع توكنز مستخدم معيّن حتى الآن */
export function getUsage(userId: string): number {
  return usageByUser.get(userId) || 0;
}

export const AI_USER_TOKEN_CAP = USER_TOKEN_CAP;
