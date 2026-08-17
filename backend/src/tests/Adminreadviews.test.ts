import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import express from 'express';
import jwt from 'jsonwebtoken';
import type { Server } from 'http';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

// --- Mock prisma so this hits no real database ---
vi.mock('../lib/prisma.js', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn().mockResolvedValue({ status: 'active' }),
    },
    order: { findMany: vi.fn() },
    enrollment: { findMany: vi.fn() },
    // getStats also lives on this router; keep it from crashing if hit
    course: { count: vi.fn() },
  },
}));

import { prisma } from '../lib/prisma.js';
import adminRoutes from '../routes/adminRoutes.js';

const mUserFindMany = prisma.user.findMany as unknown as ReturnType<typeof vi.fn>;
const mOrderFindMany = prisma.order.findMany as unknown as ReturnType<typeof vi.fn>;
const mEnrollmentFindMany = prisma.enrollment.findMany as unknown as ReturnType<typeof vi.fn>;

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
const JWT_SECRET = process.env.JWT_SECRET;

function tokenFor(role: string) {
  return jwt.sign({ userId: 'test-user', role, email: 'test@example.com' }, JWT_SECRET);
}

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/admin', adminRoutes);

  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  baseUrl = `http://127.0.0.1:${port}`;
});

afterAll(() => {
  server.close();
});

const adminToken = tokenFor('ADMIN');
const studentToken = tokenFor('STUDENT');

async function get(path: string, token?: string) {
  return fetch(`${baseUrl}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

// Node's built-in fetch types return Promise<unknown> from res.json()
// (unlike the DOM lib's Promise<any>), so we narrow it once here instead
// of casting at every call site.
async function readJson(res: Response): Promise<any> {
  return res.json();
}

describe('GET /api/admin/users', () => {
  it('admin gets users -> success (200)', async () => {
    mUserFindMany.mockResolvedValue([
      {
        id: 'u1',
        name: 'Sara',
        email: 'sara@example.com',
        role: 'Student',
        createdAt: new Date(),
        _count: { enrollments: 1 },
      },
    ]);

    const res = await get('/api/admin/users', adminToken);
    expect(res.status).toBe(200);

    const body = await readJson(res);
    expect(body.success).toBe(true);
    expect(JSON.stringify(body)).not.toMatch(/password/i);
  });

  it('student gets users -> 403', async () => {
    const res = await get('/api/admin/users', studentToken);
    expect(res.status).toBe(403);
  });

  it('no token at all -> 401', async () => {
    const res = await get('/api/admin/users');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/admin/orders', () => {
  it('admin gets orders -> success (200)', async () => {
    mOrderFindMany.mockResolvedValue([
      {
        id: 'o1',
        amount: 500,
        status: 'PAID',
        paymentId: 'pay_1',
        createdAt: new Date(),
        user: { id: 'u1', name: 'Sara', email: 'sara@example.com' },
        course: { id: 'c1', title: 'Full Stack' },
      },
    ]);

    const res = await get('/api/admin/orders', adminToken);
    expect(res.status).toBe(200);

    const body = await readJson(res);
    expect(body.success).toBe(true);
    expect(body.data.orders[0]).toMatchObject({ id: 'o1', amount: 500, status: 'PAID' });
    expect(JSON.stringify(body)).not.toMatch(/password/i);
  });

  it('student gets orders -> 403', async () => {
    const res = await get('/api/admin/orders', studentToken);
    expect(res.status).toBe(403);
  });
});

describe('GET /api/admin/enrollments', () => {
  it('admin gets enrollments -> success (200)', async () => {
    const now = Date.now();
    mEnrollmentFindMany.mockResolvedValue([
      {
        id: 'e1',
        accessStartsAt: new Date(now - 86400000),
        accessEndsAt: new Date(now + 86400000),
        createdAt: new Date(now - 172800000),
        user: { id: 'u1', name: 'Sara', email: 'sara@example.com' },
        course: { id: 'c1', title: 'Full Stack' },
      },
    ]);

    const res = await get('/api/admin/enrollments', adminToken);
    expect(res.status).toBe(200);

    const body = await readJson(res);
    expect(body.success).toBe(true);
    expect(body.data.enrollments[0].accessStatus).toBe('active');
    expect(JSON.stringify(body)).not.toMatch(/password/i);
  });

  it('student gets enrollments -> 403', async () => {
    const res = await get('/api/admin/enrollments', studentToken);
    expect(res.status).toBe(403);
  });

  describe('Authorization security', () => {
  it('invalid JWT -> 401', async () => {
    const res = await get('/api/admin/users', 'this-is-not-a-valid-jwt');
    expect(res.status).toBe(401);
  });

  it('student cannot become admin by sending role in query -> 403', async () => {
    const res = await get('/api/admin/users?role=ADMIN', studentToken);
    expect(res.status).toBe(403);
  });
});

});