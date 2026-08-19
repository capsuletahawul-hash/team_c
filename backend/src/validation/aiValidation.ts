import { z } from "zod";

/**
 * Validates the user's initial question before it reaches the AI service.
 */
export const askCoursesSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Question is required")
    .max(1000, "Question is too long"),
});

/**
 * Validates the AI model's output.
 *
 * The model output is untrusted data, so it must be parsed and
 * validated before the rest of the application uses it.
 */
export const askCoursesAnswerSchema = z.object({
  answer: z.string(),
  grounded: z.boolean(),
});