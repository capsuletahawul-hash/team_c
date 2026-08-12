import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mock the repository accessService depends on ---
vi.mock('../repositories/enrollmentRepository.js', () => ({
  enrollmentRepository: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
}));

import { enrollmentRepository } from '../repositories/enrollmentRepository.js';
import { accessService } from '../services/accessService.js';
import { requireActiveAccess } from '../middleware/accessMiddleware.js';

const mockedFindUnique = enrollmentRepository.findUnique as unknown as ReturnType<typeof vi.fn>;
const mockedCreate = enrollmentRepository.create as unknown as ReturnType<typeof vi.fn>;

function dayOffset(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('accessService.hasActiveAccess', () => {
  it('returns true for an enrollment inside its access window (active enrollment)', async () => {
    mockedFindUnique.mockResolvedValue({
      accessStartsAt: dayOffset(-1),
      accessEndsAt: dayOffset(10),
    });

    const result = await accessService.hasActiveAccess('user_1', 'course_1');
    expect(result).toBe(true);
  });

  it('returns false when accessEndsAt is in the past (expired enrollment)', async () => {
    mockedFindUnique.mockResolvedValue({
      accessStartsAt: dayOffset(-130),
      accessEndsAt: dayOffset(-10),
    });

    const result = await accessService.hasActiveAccess('user_1', 'course_1');
    expect(result).toBe(false);
  });

  it('returns false when accessStartsAt is in the future (future access)', async () => {
    mockedFindUnique.mockResolvedValue({
      accessStartsAt: dayOffset(5),
      accessEndsAt: dayOffset(125),
    });

    const result = await accessService.hasActiveAccess('user_1', 'course_1');
    expect(result).toBe(false);
  });

  it('returns false when no enrollment exists at all', async () => {
    mockedFindUnique.mockResolvedValue(null);

    const result = await accessService.hasActiveAccess('user_1', 'course_1');
    expect(result).toBe(false);
  });
});

describe('accessService.grantAccess', () => {
  it('creates an enrollment with a ~120-day window starting now', async () => {
    mockedCreate.mockResolvedValue({ id: 'enr_1' });

    await accessService.grantAccess('user_1', 'course_1');

    expect(mockedCreate).toHaveBeenCalledTimes(1);
    const [userId, courseId, startsAt, endsAt] = mockedCreate.mock.calls[0];

    expect(userId).toBe('user_1');
    expect(courseId).toBe('course_1');

    const diffDays = (endsAt.getTime() - startsAt.getTime()) / (24 * 60 * 60 * 1000);
    expect(diffDays).toBeCloseTo(120, 1);
  });
});

describe('requireActiveAccess middleware', () => {
  function makeReqRes(courseId = 'course_1', userId = 'user_1') {
    const req: any = { params: { courseId }, user: { userId } };
    const res: any = {
      statusCode: undefined,
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
    const next = vi.fn();
    return { req, res, next };
  }

  it('calls next() when the user has active access', async () => {
    mockedFindUnique.mockResolvedValue({
      accessStartsAt: dayOffset(-1),
      accessEndsAt: dayOffset(10),
    });

    const { req, res, next } = makeReqRes();
    await requireActiveAccess(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBeUndefined();
  });

  it('returns 403 access_expired when access has expired', async () => {
    mockedFindUnique.mockResolvedValue({
      accessStartsAt: dayOffset(-130),
      accessEndsAt: dayOffset(-10),
    });

    const { req, res, next } = makeReqRes();
    await requireActiveAccess(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ success: false, error: 'access_expired' });
  });

  it('returns 403 access_expired when access starts in the future', async () => {
    mockedFindUnique.mockResolvedValue({
      accessStartsAt: dayOffset(5),
      accessEndsAt: dayOffset(125),
    });

    const { req, res, next } = makeReqRes();
    await requireActiveAccess(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ success: false, error: 'access_expired' });
  });
});