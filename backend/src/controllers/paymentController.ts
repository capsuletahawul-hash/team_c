import type { Request, Response } from 'express';
import { paymentService } from '../services/paymentService.js';
import { orderRepository } from '../repositories/orderRepository.js';
import { accessService } from '../services/accessService.js';
import { emailService } from '../services/emailService.js';
// NOTE: enrollmentRepository is no longer imported/used directly here.
// Access must always be granted through accessService.grantAccess(), which
// is the only place that computes accessStartsAt / accessEndsAt.





export const paymentController = {
  /**
   * استقبال العودة من بوابة Moyasar بالـ Callback URL
   */

async startCheckout(req: Request, res: Response) {
  try {
    const authUser = (req as any).user;
    const orderId = String(req.body?.orderId || '');

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'order_id_required',
      });
    }

    const order = await orderRepository.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'order_not_found',
      });
    }

    // Make sure the order belongs to the logged-in user
    if (order.userId !== authUser.userId) {
      return res.status(403).json({
        success: false,
        error: 'forbidden',
      });
    }

    // Only pending orders can start checkout
    if (order.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: 'order_not_pending',
      });
    }

    const checkout = await paymentService.startCheckout({
      id: order.id,
      amount: order.amount,
    });

    return res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        checkoutUrl: checkout.url,
      },
    });
  } catch (error) {
    console.error('[START CHECKOUT ERROR]:', error);

    return res.status(500).json({
      success: false,
      error: 'checkout_creation_failed',
    });
  }
},


  async handleCallback(req: Request, res: Response) {
    const paymentId = req.query.id as string;
    const orderId = req.query.orderId as string;

    if (!paymentId || !orderId) {
      return res.status(400).json({ success: false, error: 'missing_payment_parameters' });
    }

    // 1. جلب الطلب من قاعدة البيانات
    const order = await orderRepository.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'order_not_found' });
    }

    // 2. التحقق من سيرفر Moyasar رسمياً (عدم التثبت من الـ Redirect URL إطلاقاً)
    const result = await paymentService.verifyPayment(paymentId, order);

    if (result.ok) {
      // تحديث حالة الطلب إلى PAID
      await orderRepository.updateStatus(order.id, 'PAID', paymentId);

      // FIX: previously called enrollmentRepository.create(order.userId, order.courseId)
      // directly — that repo method requires 4 args (userId, courseId, accessStartsAt,
      // accessEndsAt), so accessStartsAt/accessEndsAt were undefined on every real
      // payment. Always go through accessService, which owns the 120-day window logic.
      await accessService.grantAccess(order.userId, order.courseId);

try {
  await emailService.sendPurchaseConfirmation(order);
} catch (emailError) {
  console.error('[EMAIL] Purchase confirmation failed:', emailError);
}

      return res.json({
        success: true,
        data: {
          orderId: order.id,
          status: 'PAID',
          access: 'active',
        },
      });
    } else {
      // تحديث حالة الطلب إلى FAILED — never grant access on a failed/unverified payment
      await orderRepository.updateStatus(order.id, 'FAILED', paymentId);

      return res.status(400).json({
        success: false,
        error: result.reason || 'payment_verification_failed',
      });
    }
  },
};