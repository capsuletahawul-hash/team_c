import { Request, Response } from "express";

import {
  createTicketSchema,
  updateTicketStatusSchema,
} from "../validation/companyValidation.js";
import { companyRepository } from "../repositories/companyRepository.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

export const companyController = {
  /**
   * List Tickets
   */
  async getTickets(req: Request, res: Response) {
    try {
      const authUser = (req as AuthenticatedRequest).user!;
      const tickets = await companyRepository.listTicketsByCompany(authUser.userId);
      return res.status(200).json(tickets);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },

  /**
   * Create Ticket (submit a custom B2B bootcamp request)
   */
  async createTicket(req: Request, res: Response) {
    try {
      const validation = createTicketSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: validation.error.flatten().fieldErrors,
        });
      }

      const authUser = (req as AuthenticatedRequest).user!;
      const ticket = await companyRepository.createTicket(authUser.userId, validation.data);

      return res.status(201).json({ success: true, ticket });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },

  /**
   * Update Ticket Status (accept/amend a quotation)
   */
  async updateTicketStatus(req: Request, res: Response) {
    try {
      const validation = updateTicketStatusSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: validation.error.flatten().fieldErrors,
        });
      }

      const authUser = (req as AuthenticatedRequest).user!;
      const ticket = await companyRepository.updateTicketStatus(
        String(req.params.id),
        authUser.userId,
        validation.data.status
      );

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
   * List Employees
   */
  async getEmployees(req: Request, res: Response) {
    try {
      const authUser = (req as AuthenticatedRequest).user!;
      const employees = await companyRepository.listEmployeesByCompany(authUser.userId);
      return res.status(200).json(employees);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },
};
