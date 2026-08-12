import type { Response } from 'express';
import { courseRepository } from '../repositories/courseRepository.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

/**
 * NEW FILE: this is the "protected course content" endpoint the handbook
 * describes in Chapter 07 — the resource that actually needs the per-request
 * access-window check. Previously nothing in the codebase called
 * requireActiveAccess, so it existed but enforced nothing.
 *
 * Route: GET /api/courses/:courseId/content
 * Middleware chain (see courseRoutes.ts): requireAuth -> requireActiveAccess -> this
 */
export const courseContentController = {
  async getContent(req: AuthenticatedRequest, res: Response) {
    try {
      const rawCourseId = req.params.courseId;
      const courseId = Array.isArray(rawCourseId) ? rawCourseId[0] : rawCourseId;

      if (typeof courseId !== 'string') {
        return res.status(400).json({ success: false, error: 'missing_parameters' });
      }

      const course = await courseRepository.findById(courseId);

      if (!course) {
        return res.status(404).json({ success: false, error: 'course_not_found' });
      }

      // requireActiveAccess has already confirmed the caller's Enrollment
      // window is currently active before this handler ever runs.
      return res.status(200).json({
        success: true,
        data: {
          courseId: course.id,
          title: course.title,
          // Replace with real lesson/material data once that model exists.
          content: 'protected course content goes here',
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: 'internal_server_error' });
    }
  },
};