import { Request, Response } from "express";

import { submitContractSchema } from "../validation/contractValidation.js";
import { contractRepository } from "../repositories/contractRepository.js";

export const contractController = {
  /**
   * Submit a B2B contract / company-onboarding request (public, no auth —
   * this runs before the company has an account).
   */
  async submitContract(req: Request, res: Response) {
    try {
      const validation = submitContractSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: validation.error.flatten().fieldErrors,
        });
      }

      const request = await contractRepository.create(validation.data);

      return res.status(201).json({ success: true, request });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },
};
