import { Request, Response } from 'express';
import { aiService } from '../services/aiService.js';
import { AI_ERROR_CODES } from '../types/ai.js';

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
        // FIX: use the shared AI_ERROR_CODES constants (types/ai.ts) instead of a
        // hand-typed map — the old map was missing ai_rate_limited entirely and
        // used 'cost_cap_reached' instead of the canonical 'ai_cost_cap_reached',
        // so those thrown errors fell through to the generic fallback below.
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