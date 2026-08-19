import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks for orderService's dependencies ---
vi.mock('../repositories/courseRepository.js', () => ({
  courseRepository: {
    findById: vi.fn(),
  },
}));

vi.mock('../repositories/userRepository.js', () => ({
  userRepository: {
    findById: vi.fn().mockImplementation((id: string) => Promise.resolve({ id, name: 'Test User' })),
  },
}));

vi.mock('../repositories/orderRepository.js', () => ({
  orderRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

vi.mock('../services/accessService.js', () => ({
  accessService: {
    hasActiveAccess: vi.fn(),
    grantAccess: vi.fn(),
  },
}));

vi.mock('../services/paymentService.js', () => ({
  paymentService: {
    verifyPayment: vi.fn(),
  },
}));

vi.mock('../services/emailService.js', () => ({
  emailService: {
    sendPurchaseConfirmation: vi.fn(),
  },
}));

import { courseRepository } from '../repositories/courseRepository.js';
import { orderRepository } from '../repositories/orderRepository.js';
import { accessService } from '../services/accessService.js';
import { paymentService } from '../services/paymentService.js';
import { emailService } from '../services/emailService.js';
import { orderService } from '../services/orderService.js';
import { paymentController } from '../controllers/paymentController.js';
import { AppError } from '../middleware/errorHandler.js';

const mCourseFindById =
  courseRepository.findById as unknown as ReturnType<typeof vi.fn>;

const mOrderCreate =
  orderRepository.create as unknown as ReturnType<typeof vi.fn>;

const mOrderFindById =
  orderRepository.findById as unknown as ReturnType<typeof vi.fn>;

const mOrderUpdateStatus =
  orderRepository.updateStatus as unknown as ReturnType<typeof vi.fn>;

const mHasActiveAccess =
  accessService.hasActiveAccess as unknown as ReturnType<typeof vi.fn>;

const mGrantAccess =
  accessService.grantAccess as unknown as ReturnType<typeof vi.fn>;

const mVerifyPayment =
  paymentService.verifyPayment as unknown as ReturnType<typeof vi.fn>;

const mSendPurchaseConfirmation =
  emailService.sendPurchaseConfirmation as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

// ======================================================
// ORDER TESTS
// ======================================================

describe('orderService.createOrder — duplicate purchase rule', () => {
  it('rejects creating an order when the user already has active access (already_enrolled)', async () => {
    mCourseFindById.mockResolvedValue({
      id: 'course_1',
      price: 100,
    });

    mHasActiveAccess.mockResolvedValue(true);

    await expect(
      orderService.createOrder('user_1', 'course_1')
    ).rejects.toMatchObject(new AppError('already_enrolled', 409));

    expect(mOrderCreate).not.toHaveBeenCalled();
  });

  it('allows creating a new order when a prior enrollment exists but has expired', async () => {
    mCourseFindById.mockResolvedValue({
      id: 'course_1',
      price: 100,
    });

    mHasActiveAccess.mockResolvedValue(false);

    mOrderCreate.mockResolvedValue({
      id: 'ord_1',
      status: 'PENDING',
    });

    const order = await orderService.createOrder('user_1', 'course_1');

    expect(order.status).toBe('PENDING');

    expect(mOrderCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user_1',
        courseId: 'course_1',
        amount: 100,
      })
    );
  });

  it('404s when the course does not exist', async () => {
    mCourseFindById.mockResolvedValue(null);

    await expect(
      orderService.createOrder('user_1', 'course_x')
    ).rejects.toMatchObject(new AppError('course_not_found', 404));
  });
});

// ======================================================
// PAYMENT TESTS
// ======================================================

describe('paymentController.handleCallback — payment flow', () => {
  function makeReqRes(query: Record<string, string>) {
    const req: any = {
      query,
    };

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

  // ----------------------------------------------------
  // TEST 1 — Successful purchase
  // ----------------------------------------------------

  it('successful payment: updates order to PAID and grants access', async () => {
    const order = {
      id: 'ord_1',
      userId: 'user_1',
      courseId: 'course_1',
      amount: 100,
      status: 'PENDING',
    };

    mOrderFindById.mockResolvedValue(order);

    mVerifyPayment.mockResolvedValue({
      ok: true,
      payment: {
        status: 'paid',
      },
    });

    mSendPurchaseConfirmation.mockResolvedValue(undefined);

    const { req, res } = makeReqRes({
      id: 'pay_1',
      orderId: 'ord_1',
    });

    await paymentController.handleCallback(req, res);

    expect(mOrderUpdateStatus).toHaveBeenCalledWith(
      'ord_1',
      'PAID',
      'pay_1'
    );

    expect(mGrantAccess).toHaveBeenCalledWith(
      'user_1',
      'course_1'
    );

    expect(mSendPurchaseConfirmation).toHaveBeenCalledWith(order);

    expect(res.body).toMatchObject({
      success: true,
      data: {
        status: 'PAID',
        access: 'active',
      },
    });
  });

  // ----------------------------------------------------
  // TEST 2 — Failed payment
  // ----------------------------------------------------

  it('failed payment: updates order to FAILED and never grants access', async () => {
    const order = {
      id: 'ord_2',
      userId: 'user_1',
      courseId: 'course_1',
      amount: 100,
      status: 'PENDING',
    };

    mOrderFindById.mockResolvedValue(order);

    mVerifyPayment.mockResolvedValue({
      ok: false,
      reason: 'payment_not_paid',
    });

    const { req, res } = makeReqRes({
      id: 'pay_2',
      orderId: 'ord_2',
    });

    await paymentController.handleCallback(req, res);

    expect(mOrderUpdateStatus).toHaveBeenCalledWith(
      'ord_2',
      'FAILED',
      'pay_2'
    );

    expect(mGrantAccess).not.toHaveBeenCalled();

    expect(mSendPurchaseConfirmation).not.toHaveBeenCalled();

    expect(res.statusCode).toBe(400);

    expect(res.body).toMatchObject({
      success: false,
      error: 'payment_not_paid',
    });
  });

  // ----------------------------------------------------
  // TEST 4 — Fake redirect / wrong order metadata
  // ----------------------------------------------------

  it('fake redirect: rejects payment when metadata orderId does not match the order', async () => {
    const order = {
      id: 'ord_3',
      userId: 'user_1',
      courseId: 'course_1',
      amount: 100,
      status: 'PENDING',
    };

    mOrderFindById.mockResolvedValue(order);

    mVerifyPayment.mockResolvedValue({
      ok: false,
      reason: 'wrong_order_metadata',
    });

    const { req, res } = makeReqRes({
      id: 'fake_payment',
      orderId: 'ord_3',
    });

    await paymentController.handleCallback(req, res);

    expect(mVerifyPayment).toHaveBeenCalledWith(
      'fake_payment',
      order
    );

    expect(mOrderUpdateStatus).toHaveBeenCalledWith(
      'ord_3',
      'FAILED',
      'fake_payment'
    );

    expect(mGrantAccess).not.toHaveBeenCalled();

    expect(res.statusCode).toBe(400);

    expect(res.body).toMatchObject({
      success: false,
      error: 'wrong_order_metadata',
    });
  });

  // ----------------------------------------------------
  // TEST 5 — Amount tampering
  // ----------------------------------------------------

  it('amount tampering: rejects payment when paid amount does not match order amount', async () => {
    const order = {
      id: 'ord_4',
      userId: 'user_1',
      courseId: 'course_1',
      amount: 250,
      status: 'PENDING',
    };

    mOrderFindById.mockResolvedValue(order);

    mVerifyPayment.mockResolvedValue({
      ok: false,
      reason: 'amount_mismatch',
    });

    const { req, res } = makeReqRes({
      id: 'tampered_payment',
      orderId: 'ord_4',
    });

    await paymentController.handleCallback(req, res);

    expect(mVerifyPayment).toHaveBeenCalledWith(
      'tampered_payment',
      order
    );

    expect(mOrderUpdateStatus).toHaveBeenCalledWith(
      'ord_4',
      'FAILED',
      'tampered_payment'
    );

    expect(mGrantAccess).not.toHaveBeenCalled();

    expect(res.statusCode).toBe(400);

    expect(res.body).toMatchObject({
      success: false,
      error: 'amount_mismatch',
    });
  });

  // ----------------------------------------------------
  // TEST 6 — Double purchase
  // ----------------------------------------------------

  it('double purchase: rejects creating another order when access is already active', async () => {
    mCourseFindById.mockResolvedValue({
      id: 'course_5',
      price: 250,
    });

    mHasActiveAccess.mockResolvedValue(true);

    await expect(
      orderService.createOrder('user_1', 'course_5')
    ).rejects.toMatchObject(
      new AppError('already_enrolled', 409)
    );

    expect(mOrderCreate).not.toHaveBeenCalled();
  });

  // ----------------------------------------------------
  // TEST 8 — Email failure
  // ----------------------------------------------------

  it('email failure: purchase remains PAID and access remains active', async () => {
    const order = {
      id: 'ord_8',
      userId: 'user_1',
      courseId: 'course_1',
      amount: 100,
      status: 'PENDING',
      user: {
        email: 'test@example.com',
      },
      course: {
        title: 'Test Course',
      },
    };

    mOrderFindById.mockResolvedValue(order);

    mVerifyPayment.mockResolvedValue({
      ok: true,
      payment: {
        status: 'paid',
      },
    });

    mSendPurchaseConfirmation.mockRejectedValue(
      new Error('Email provider failed')
    );

    const { req, res } = makeReqRes({
      id: 'pay_8',
      orderId: 'ord_8',
    });

    await paymentController.handleCallback(req, res);

    // Purchase must still succeed
    expect(mOrderUpdateStatus).toHaveBeenCalledWith(
      'ord_8',
      'PAID',
      'pay_8'
    );

    // Access must still be granted
    expect(mGrantAccess).toHaveBeenCalledWith(
      'user_1',
      'course_1'
    );

    // Email was attempted
    expect(mSendPurchaseConfirmation).toHaveBeenCalledWith(order);

    // Final response is still successful
    expect(res.statusCode).toBe(200);

    expect(res.body).toMatchObject({
      success: true,
      data: {
        status: 'PAID',
        access: 'active',
      },
    });
  });
});