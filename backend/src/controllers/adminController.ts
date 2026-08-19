import { Request, Response } from "express";

import { trainerRepository, TrainerCourse } from "../repositories/trainerRepository.js";
import { userRepository } from "../repositories/userRepository.js";
import { contractRepository } from "../repositories/contractRepository.js";
import { companyRepository, TicketStatus } from "../repositories/companyRepository.js";
import { prisma } from "../lib/prisma.js";
import { adminService } from "../services/adminService.js";
import {
  createAdminCourseSchema,
  updateAdminCourseSchema,
} from "../validation/adminCourseValidation.js";

// يحول حالة الدورة الداخلية إلى حالة الموافقة اللي تفهمها صفحة الأدمن
function toApprovalStatus(status: TrainerCourse["status"]): "pending" | "approved" | "rejected" | "pending_deletion" {
  if (status === "rejected") return "rejected";
  if (status === "coming_soon") return "pending";
  if (status === "pending_deletion") return "pending_deletion";
  return "approved"; // available
}

export const adminController = {
  /**
   * Admin statistics
   */
  async getStats(_req: Request, res: Response) {
    try {
      const now = new Date();

      const totalUsers = await prisma.user.count();

      const revenueResult = await prisma.order.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          status: {
            in: ["PAID", "paid", "COMPLETED", "completed", "PENDING", "pending"],
          },
        },
      });

      const activeEnrollments = await prisma.enrollment.count({
        where: {
          accessStartsAt: {
            lte: now,
          },
          accessEndsAt: {
            gte: now,
          },
        },
      });

      return res.status(200).json({
        success: true,
        data: {
          totalUsers,
          totalRevenue: revenueResult._sum.amount ?? 0,
          activeEnrollments,
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        error: "internal_server_error",
      });
    }
  },

  /**
   * List all courses across every trainer, for approval review
   */
  async getCourses(_req: Request, res: Response) {
    try {
      const courses = await trainerRepository.listAllCourses();

      const enriched = await Promise.all(
        courses.map(async (course) => {
          const trainer = await userRepository.findById(course.trainerId);
          return {
            id: course.id,
            title: course.title,
            trainer: trainer?.name || "",
            category: course.category,
            durationVal: course.durationWeeks,
            status: toApprovalStatus(course.status),
          };
        })
      );

      return res.status(200).json({ success: true, data: { courses: enriched } });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },

  /**
   * Approve a pending course
   */
  async approveCourse(req: Request, res: Response) {
    try {
      const courseId = String(req.params.id);
      const course = await trainerRepository.approveCourse(courseId);

      if (!course) {
        return res.status(404).json({ success: false, error: "course_not_found" });
      }

      return res.status(200).json({ success: true, course });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },

  /**
   * Reject a pending course
   */
  async rejectCourse(req: Request, res: Response) {
    try {
      const courseId = String(req.params.id);
      const course = await trainerRepository.rejectCourse(courseId);

      if (!course) {
        return res.status(404).json({ success: false, error: "course_not_found" });
      }

      return res.status(200).json({ success: true, course });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },

  /**
   * Approve a course deletion request (permanently delete the course)
   */
  async approveDeletion(req: Request, res: Response) {
    try {
      const courseId = String(req.params.id);
      const deleted = await adminService.deleteCourse(courseId);

      if (!deleted) {
        return res.status(404).json({ success: false, error: "course_not_found" });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },

  /**
   * Reject a course deletion request (keep course and restore status to 'available')
   */
  async rejectDeletion(req: Request, res: Response) {
    try {
      const courseId = String(req.params.id);
      const course = await prisma.course.update({
        where: { id: courseId },
        data: { status: 'available' },
      });

      if (!course) {
        return res.status(404).json({ success: false, error: "course_not_found" });
      }

      return res.status(200).json({ success: true, course });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },

  /**
   * Create a course directly (admin-managed CRUD, distinct from the
   * trainer-submission/approval flow above)
   */
  async createCourse(req: Request, res: Response) {
    try {
      const validation = createAdminCourseSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: validation.error.flatten().fieldErrors,
        });
      }

      const course = await adminService.createCourse(validation.data);
      return res.status(201).json({ success: true, data: { course } });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },

  /**
   * Update a course directly (admin-managed CRUD)
   */
  async updateCourse(req: Request, res: Response) {
    try {
      const validation = updateAdminCourseSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: validation.error.flatten().fieldErrors,
        });
      }

      const course = await adminService.updateCourse(String(req.params.id), validation.data);

      if (!course) {
        return res.status(404).json({ success: false, error: "course_not_found" });
      }

      return res.status(200).json({ success: true, data: { course } });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },

  /**
   * Delete a course directly (admin-managed CRUD)
   */
  async deleteCourse(req: Request, res: Response) {
    try {
      const deleted = await adminService.deleteCourse(String(req.params.id));

      if (!deleted) {
        return res.status(404).json({ success: false, error: "course_not_found" });
      }

      return res.status(204).send();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },

  /**
   * List all B2B contract / company-onboarding requests, for review
   */

  /**
   * List all orders for admin
   */
  async getOrders(_req: Request, res: Response) {
    try {
      const orders = await prisma.order.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json({
        success: true,
        data: { orders },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        error: "internal_server_error",
      });
    }
  },

  /**
   * List all enrollments for admin
   */
  async getEnrollments(_req: Request, res: Response) {
    try {
      const enrollments = await prisma.enrollment.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const now = new Date();

      const enriched = enrollments.map((enrollment : any) => {
        let accessStatus = "inactive";

        if (
          enrollment.accessStartsAt <= now &&
          enrollment.accessEndsAt >= now
        ) {
          accessStatus = "active";
        } else if (enrollment.accessStartsAt > now) {
          accessStatus = "upcoming";
        } else if (enrollment.accessEndsAt < now) {
          accessStatus = "expired";
        }

        return {
          ...enrollment,
          accessStatus,
        };
      });

      return res.status(200).json({
        success: true,
        data: { enrollments: enriched },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        error: "internal_server_error",
      });
    }
  },

  async getContracts(_req: Request, res: Response) {
    try {
      const requests = await contractRepository.findAll();
      return res.status(200).json({ success: true, data: { requests } });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },

  /**
   * Approve a pending contract request
   */
  async approveContract(req: Request, res: Response) {
    try {
      const request = await contractRepository.approve(String(req.params.id));

      if (!request) {
        return res.status(404).json({ success: false, error: "contract_not_found" });
      }

      return res.status(200).json({ success: true, request });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },

  /**
   * Reject a pending contract request
   */
  async rejectContract(req: Request, res: Response) {
    try {
      const request = await contractRepository.reject(String(req.params.id));

      if (!request) {
        return res.status(404).json({ success: false, error: "contract_not_found" });
      }

      return res.status(200).json({ success: true, request });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },

  /**
   * List all company bootcamp/training tickets (submitted from the
   * "Request Bootcamp" tab in the Company Dashboard), across every company,
   * enriched with the company's real registered name for display.
   */
  async getTickets(_req: Request, res: Response) {
    try {
      const tickets = await companyRepository.listAllTickets();

      const enriched = await Promise.all(
        tickets.map(async (ticket) => {
          const company = await userRepository.findById(ticket.companyId);
          return { ...ticket, companyName: company?.name || "" };
        })
      );

      return res.status(200).json({ success: true, data: { tickets: enriched } });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },

  /**
   * Update a ticket's status (e.g. issue a quote by moving it from "review"
   * to "issued") — the Admin equivalent of companyController.updateTicketStatus,
   * not scoped to a single company.
   */
  async updateTicketStatus(req: Request, res: Response) {
    try {
      const status = req.body?.status as TicketStatus;

      if (!["review", "issued", "approved"].includes(status)) {
        return res.status(400).json({ success: false, error: "invalid_status" });
      }

      const ticket = await companyRepository.setTicketStatusByAdmin(String(req.params.id), status);

      if (!ticket) {
        return res.status(404).json({ success: false, error: "ticket_not_found" });
      }

      return res.status(200).json({ success: true, ticket });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },

  /**
   * Admin read-only view: list all registered users.
   *
   * Uses Prisma `select` to explicitly whitelist safe fields — password
   * hashes must never be returned here. `_count` gives the enrollment
   * count for each user in the same query (no N+1 loop over users).
   */
  async getUsers(_req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: { enrollments: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const data = users.map((u: (typeof users)[number]) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        enrollmentCount: u._count.enrollments,
      }));

      return res.status(200).json({ success: true, data: { users: data } });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },

};