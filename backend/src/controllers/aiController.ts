import { Request, Response } from 'express';
import { aiService } from '../services/aiService.js';
import { askCoursesSchema } from '../validation/aiValidation.js';
import { AI_ERROR_CODES } from '../types/ai.js';

export const askAboutCourses = async (req: Request, res: Response) => {
    try {
        // Validate and normalize the user's input with Zod
        const validation = askCoursesSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                error: AI_ERROR_CODES.VALIDATION_FAILED,
            });
        }

        const { question } = validation.data;

        const answer = await aiService.askAboutCourses(question);

        return res.status(200).json({
            success: true,
            data: {
                answer,
            },
        });
    } catch (error: any) {
        const knownCodes: string[] = Object.values(AI_ERROR_CODES);

        const mappedError = knownCodes.includes(error.message)
            ? error.message
            : AI_ERROR_CODES.INTERNAL_ERROR;

        return res.status(error.status || 500).json({
            success: false,
            error: mappedError,
        });
    }
};