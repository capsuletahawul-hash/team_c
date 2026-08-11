import { Request, Response } from "express";

import { trainerRepository, TrainerCourse } from "../repositories/trainerRepository.js";
import { userRepository } from "../repositories/userRepository.js";
import { contractRepository } from "../repositories/contractRepository.js";
import { companyRepository, TicketStatus } from "../repositories/companyRepository.js";

// يحول حالة الدورة الداخلية إلى حالة الموافقة اللي تفهمها صفحة الأدمن
function toApprovalStatus(status: TrainerCourse["status"]): "pending" | "approved" | "rejected" {
  if (status === "rejected") return "rejected";
  if (status === "coming_soon") return "pending";
  return "approved"; // available / pending_deletion — كورس سبق اعتماده
}

export const adminController = {
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
   * List all B2B contract / company-onboarding requests, for review
   */
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
};
