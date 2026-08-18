import { Request, Response } from 'express';
import { aiService } from '../services/aiService.js';

export const askAboutCourses = async (req: Request, res: Response) => {
    try {
        const { question } = req.body;

        if (!question || typeof question !== 'string' || !question.trim()) {
            return res.status(400).json({
                success: false,
                error: 'invalid_question',
            });
        }

        const answer = await aiService.askAboutCourses(question.trim());

        return res.status(200).json({
            success: true,
            data: {
                answer,
            },
        });
    } catch (error: any) {
        const errorMap: Record<string, string> = {
            ai_provider_error: 'ai_provider_error',
            ai_timeout: 'ai_timeout',
            ai_bad_format: 'ai_bad_format',
            ai_bad_shape: 'ai_bad_shape',
            cost_cap_reached: 'cost_cap_reached',
        };

        const mappedError = errorMap[error.message] || 'ai_service_unavailable';

        return res.status(error.status || 500).json({
            success: false,
            error: mappedError,
        });
    }
};