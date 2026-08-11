import { moyasarClient } from '../lib/moyasar.js';

interface VerifyResult {
  ok: boolean;
  reason?: string;
  payment?: any;
}

export const paymentService = {
  /**
   * 1. بدء الدفع وإصدار Checkout من Moyasar Sandbox
   */
  async startCheckout(order: { id: string; amount: number }) {
    // Moyasar يتعامل بالهللات (SAR -> Halalas)، المبالغ تكون أعداد صحيحة
    const amountInHalalas = Math.round(order.amount * 100);

    const response = await moyasarClient.post('/invoices', {
      amount: amountInHalalas,
      currency: 'SAR',
      description: `Order ${order.id}`,
      callback_url: `${process.env.APP_URL || 'http://localhost:3001'}/api/payment/return`,
      metadata: {
        orderId: order.id, // ربط الدفعة بالطلب بالـ Metadata
      },
    });

    return response.data; // يحتوي على url التوجيه للبوابة
  },

  /**
   * 2. التحقق من الدفع Server-to-Server (الأمان الأساسي)
   */
  async verifyPayment(paymentId: string, order: { id: string; amount: number; status: string }): Promise<VerifyResult> {
    try {
      // جلب بيانات الدفعة مباشرة من سيرفر Moyasar
      const response = await moyasarClient.get(`/payments/${paymentId}`);
      const payment = response.data;

      // 1. الفحص الأول: هل العملية مقبولة ومسددة بالكامل لدى Moyasar؟
      if (payment.status !== 'paid') {
        return { ok: false, reason: 'payment_not_paid' };
      }

      // 2. الفحص الثاني: مطابقة المبلغ المدفوع بالهللات مع مبلغ الطلب المحفوظ في الـ DB
      const expectedAmountInHalalas = Math.round(order.amount * 100);
      if (payment.amount !== expectedAmountInHalalas) {
        return { ok: false, reason: 'amount_mismatch' };
      }

      // 3. الفحص الثالث: هل هذه الدفعة تخص هذا الطلب فعلاً؟
      if (payment.metadata?.orderId !== order.id) {
        return { ok: false, reason: 'wrong_order_metadata' };
      }

      // 4. الفحص الرابع: هل تم تنفيذ وتأكيد هذا الطلب مسبقاً؟ (منع التكرار)
      if (order.status === 'PAID') {
        return { ok: false, reason: 'already_fulfilled' };
      }

      return { ok: true, payment };
    } catch (error: any) {
      console.error('[PAYMENT VERIFICATION ERROR]:', error?.response?.data || error.message);
      return { ok: false, reason: 'gateway_error' };
    }
  },
};