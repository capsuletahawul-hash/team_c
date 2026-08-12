import { Request, Response } from "express";

import { b2bRequestSchema } from "../validation/b2bValidation.js";
import { prismaB2BRepository } from "../repositories/prismaB2BRepository.js";
import { emailService } from "../services/emailService.js";

export const b2bController = {
  async submitRequest(req: Request, res: Response) {
    try {
      const validation = b2bRequestSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: validation.error.flatten().fieldErrors,
        });
      }

      // Store the B2B lead first.
      const request = await prismaB2BRepository.create(validation.data);

      // Notification is a side effect. A notification failure must not
      // undo a successfully stored B2B request.
      try {
        await emailService.notifyB2BRequest(request);
      } catch (emailError: unknown) {
        console.error("[EMAIL] B2B notification failed", {
          requestId: request.id,
          error:
            emailError instanceof Error
              ? emailError.message
              : "Unknown email error",
        });
      }

      return res.status(201).json({
        success: true,
        message: "B2B request submitted successfully",
        request,
      });
    } catch (err: unknown) {
      console.error(err);

      const errorMessage =
        err instanceof Error ? err.message : "Server Error";

      return res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  },

  async getRequests(_req: Request, res: Response) {
    try {
      const requests = await prismaB2BRepository.findAll();

      return res.status(200).json({
        success: true,
        requests,
      });
    } catch (err: unknown) {
      console.error(err);

      const errorMessage =
        err instanceof Error ? err.message : "Server Error";

      return res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  },

  async getRequestById(req: Request, res: Response) {
    try {
      const request = await prismaB2BRepository.findById(
        String(req.params.id)
      );

      if (!request) {
        return res.status(404).json({
          success: false,
          error: "b2b_request_not_found",
        });
      }

      return res.status(200).json({
        success: true,
        request,
      });
    } catch (err: unknown) {
      console.error(err);

      const errorMessage =
        err instanceof Error ? err.message : "Server Error";

      return res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  },
};