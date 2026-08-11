import { Request, Response } from 'express';

import { orderService } from '../services/orderService.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const orderController = {
  /**
   * إنشاء طلب PENDING — العميل يرسل courseId فقط، السعر يُقرأ من قاعدة البيانات (Step 1-2)
   */
  async createOrder(req: Request, res: Response) {
    try {
      const authUser = (req as AuthenticatedRequest).user!;
      const courseId = String(req.body?.courseId || '');

      if (!courseId) {
        return res.status(400).json({ success: false, error: 'course_id_required' });
      }

      const order = await orderService.createOrder(authUser.userId, courseId);

      return res.status(201).json({ success: true, data: order });
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ success: false, error: err.message });
      }

      console.error(err);
      return res.status(500).json({ success: false, error: 'internal_server_error' });
    }
  },
};
