import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks for orderService's dependencies ---
vi.mock('../repositories/courseRepository.js', () => ({
  courseRepository: { findById: vi.fn() },
}));
vi.mock('../repositories/orderRepository.js', () => ({
  orderRepository: { create: vi.fn(), findById: vi.fn(), updateStatus: vi.fn() },
}));
vi.mock('../services/accessService.js', () => ({
  accessService: { hasActiveAccess: vi.fn(), grantAccess: vi.fn() },
}));
vi.mock('../services/paymentService.js', () => ({
  paymentService: { verifyPayment: vi.fn() },
}));

import { courseRepository } from '../repositories/courseRepository.js';
import { orderRepository } from '../repositories/orderRepository.js';
import { accessService } from '../services/accessService.js';
import { paymentService } from '../services/paymentService.js';
import { orderService } from '../services/orderService.js';
import { paymentController } from '../controllers/paymentController.js';
import { AppError } from '../middleware/errorHandler.js';

const mCourseFindById = courseRepository.findById as unknown as ReturnType<typeof vi.fn>;
const mOrderCreate = orderRepository.create as unknown as ReturnType<typeof vi.fn>;
const mOrderFindById = orderRepository.findById as unknown as ReturnType<typeof vi.fn>;
const mOrderUpdateStatus = orderRepository.updateStatus as unknown as ReturnType<typeof vi.fn>;
const mHasActiveAccess = accessService.hasActiveAccess as unknown as ReturnType<typeof vi.fn>;
const mGrantAccess = accessService.grantAccess as unknown as ReturnType<typeof vi.fn>;
const mVerifyPayment = paymentService.verifyPayment as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('orderService.createOrder — duplicate purchase rule', () => {
  it('rejects creating an order when the user already has active access (already_enrolled)', async () => {
    mCourseFindById.mockResolvedValue({ id: 'course_1', price: 100 });
    mHasActiveAccess.mockResolvedValue(true);

    await expect(orderService.createOrder('user_1', 'course_1')).rejects.toMatchObject(
      new AppError('already_enrolled', 409)
    );
    expect(mOrderCreate).not.toHaveBeenCalled();
  });

  it('allows creating a new order when a prior enrollment exists but has expired', async () => {
    mCourseFindById.mockResolvedValue({ id: 'course_1', price: 100 });
    mHasActiveAccess.mockResolvedValue(false); // expired enrollment row exists, but not active
    mOrderCreate.mockResolvedValue({ id: 'ord_1', status: 'PENDING' });

    const order = await orderService.createOrder('user_1', 'course_1');

    expect(order.status).toBe('PENDING');
    expect(mOrderCreate).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user_1', courseId: 'course_1', amount: 100 })
    );
  });

  it('404s when the course does not exist', async () => {
    mCourseFindById.mockResolvedValue(null);

    await expect(orderService.createOrder('user_1', 'course_x')).rejects.toMatchObject(
      new AppError('course_not_found', 404)
    );
  });
});

describe('paymentController.handleCallback — grant/deny access', () => {
  function makeReqRes(query: Record<string, string>) {
    const req: any = { query };
    const res: any = {
      statusCode: 200,
      body: undefined,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(payload: unknown) {
        this.body = payload;
        return this;
      },
    };
    return { req, res };
  }

  it('successful payment: updates order to PAID and grants access via accessService', async () => {
    const order = { id: 'ord_1', userId: 'user_1', courseId: 'course_1', amount: 100, status: 'PENDING' };
    mOrderFindById.mockResolvedValue(order);
    mVerifyPayment.mockResolvedValue({ ok: true, payment: { status: 'paid' } });

    const { req, res } = makeReqRes({ id: 'pay_1', orderId: 'ord_1' });
    await paymentController.handleCallback(req, res);

    expect(mOrderUpdateStatus).toHaveBeenCalledWith('ord_1', 'PAID', 'pay_1');
    expect(mGrantAccess).toHaveBeenCalledWith('user_1', 'course_1');
    expect(res.body).toMatchObject({ success: true, data: { status: 'PAID', access: 'active' } });
  });

  it('failed payment: updates order to FAILED and never grants access', async () => {
    const order = { id: 'ord_2', userId: 'user_1', courseId: 'course_1', amount: 100, status: 'PENDING' };
    mOrderFindById.mockResolvedValue(order);
    mVerifyPayment.mockResolvedValue({ ok: false, reason: 'payment_not_paid' });

    const { req, res } = makeReqRes({ id: 'pay_2', orderId: 'ord_2' });
    await paymentController.handleCallback(req, res);

    expect(mOrderUpdateStatus).toHaveBeenCalledWith('ord_2', 'FAILED', 'pay_2');
    expect(mGrantAccess).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({ success: false, error: 'payment_not_paid' });
  });
});