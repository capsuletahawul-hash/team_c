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
    // Moyasar يتعامل بالهللات (SAR -> Halalas)
    const amountInHalalas = Math.round(order.amount * 100);

    const response = await moyasarClient.post('/invoices', {
      amount: amountInHalalas,
      currency: 'SAR',
      description: `Order ${order.id}`,
      callback_url: `${process.env.APP_URL || 'http://localhost:5000'}/api/payment/return`,
      metadata: {
        orderId: order.id,
      },
    });

    return response.data;
  },

  /**
   * 2. التحقق من الدفع Server-to-Server
   */
  async verifyPayment(
    paymentId: string,
    order: { id: string; amount: number; status: string }
  ): Promise<VerifyResult> {
    try {
      // جلب بيانات الدفعة مباشرة من Moyasar
      const response = await moyasarClient.get(`/payments/${paymentId}`);
      const payment = response.data;

      // 1. التأكد أن الدفع ناجح
      if (payment.status !== 'paid') {
        return { ok: false, reason: 'payment_not_paid' };
      }

      // 2. مطابقة المبلغ مع قيمة الطلب المحفوظة في قاعدة البيانات
      const expectedAmountInHalalas = Math.round(order.amount * 100);

      if (payment.amount !== expectedAmountInHalalas) {
        return { ok: false, reason: 'amount_mismatch' };
      }

      // 3. التأكد أن الدفع مرتبط بالطلب الصحيح
      if (payment.metadata?.orderId !== order.id) {
        return { ok: false, reason: 'wrong_order_metadata' };
      }

      // 4. منع تنفيذ نفس الطلب أكثر من مرة
      if (order.status === 'PAID') {
        return { ok: false, reason: 'already_fulfilled' };
      }

      return {
        ok: true,
        payment,
      };
    } catch (error: any) {
      console.error(
        '[PAYMENT VERIFICATION ERROR]:',
        error?.response?.data || error.message
      );

      return {
        ok: false,
        reason: 'gateway_error',
      };
    }
  },
};