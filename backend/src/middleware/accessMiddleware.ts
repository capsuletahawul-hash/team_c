// src/middleware/accessMiddleware.ts
import { Response, NextFunction } from 'express';
import { accessService } from '../services/accessService.js';
// Make sure this path correctly points to where your auth middleware is!
import { AuthenticatedRequest } from './authMiddleware.js'; 

export const requireActiveAccess = async (
  req: AuthenticatedRequest, // Use your custom request type here!
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Get the user ID exactly as defined in your JWT payload
    const userId = req.user?.userId; 
    
  // 2. Get the course ID and guarantee it is a single string
    const rawCourseId = req.params.courseId; // (or req.query.courseId depending on your route)
    const courseId = Array.isArray(rawCourseId) ? rawCourseId[0] : rawCourseId;

    if (!userId || typeof courseId !== 'string') {
       res.status(400).json({ success: false, error: 'missing_parameters' });
       return;
    }

    // 3. Ask the Service layer if the window is still active
    const isActive = await accessService.hasActiveAccess(userId, courseId);

    // 4. Enforce the business rule from the handbook
    if (!isActive) {
       res.status(403).json({
        success: false,
        error: "access_expired" // The exact error required[cite: 1]
      });
      return;
    }

    // 5. If active, let them proceed
    next();
  } catch (error) {
    next(error);
  }
};