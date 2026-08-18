/**
 * Shared contracts for the Week 7 AI feature.
 *
 * Everyone on the team imports from this file instead of redefining
 * their own shapes. That's the whole point of writing it first: Role 2's
 * Zod schemas should validate INTO these types, Role 4's controller
 * should return ApiResult<AskCoursesAnswer>, and Role 5's frontend can
 * import AskCoursesResponse straight from here (or a copy of this file)
 * so nobody's guessing field names during integration.
 */

// ---------------------------------------------------------------------
// Generic API envelope — matches the { success, data, error } pattern
// already used across the rest of the backend (see courseContentController.ts).
// ---------------------------------------------------------------------
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string; // stable machine-readable code, e.g. "ai_bad_shape"
}

export type ApiResult<T> = ApiSuccess<T> | ApiError;

// ---------------------------------------------------------------------
// Chat message roles (Handbook Ch. 05)
// ---------------------------------------------------------------------
export type AiRole = 'system' | 'user' | 'assistant';

export interface AiMessage {
  role: AiRole;
  content: string;
}

// ---------------------------------------------------------------------
// POST /api/ai/ask
// ---------------------------------------------------------------------

// Role 2's input Zod schema should validate the request body into this.
export interface AskCoursesRequest {
  question: string;
}

// Role 2's output Zod schema should validate the model's parsed JSON
// into this shape BEFORE the controller (Role 4) ever sees it.
export interface AskCoursesAnswer {
  answer: string;
  // true if the assistant said "I don't have that information" instead
  // of answering from injected context. Lets the frontend/analytics
  // distinguish "answered" from "declined" without string-matching.
  grounded: boolean;
}

export type AskCoursesResponse = ApiResult<AskCoursesAnswer>;

// ---------------------------------------------------------------------
// Course context injected into the prompt (Handbook Ch. 06 — "poor man's RAG")
// Matches what courseRepository.findManyForAiContext() returns below.
// ---------------------------------------------------------------------
export interface CourseContext {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
  durationWeeks: number;
  status: string;
  seatsLeft: number;
  trainerName: string;
}

// ---------------------------------------------------------------------
// Known error codes, so aiClient / aiService / middleware / controller
// all throw and return the exact same strings instead of near-misses.
// ---------------------------------------------------------------------
export const AI_ERROR_CODES = {
  NOT_CONFIGURED: 'ai_not_configured', // AI_API_URL / AI_API_KEY missing
  PROVIDER_ERROR: 'ai_provider_error', // provider down / non-2xx
  TIMEOUT: 'ai_timeout', // request exceeded AI_REQUEST_TIMEOUT_MS
  BAD_FORMAT: 'ai_bad_format', // model output wasn't valid JSON
  BAD_SHAPE: 'ai_bad_shape', // valid JSON, wrong shape (Zod rejected it)
  RATE_LIMITED: 'ai_rate_limited', // Role 3's aiRateLimiter tripped
  COST_CAP_REACHED: 'ai_cost_cap_reached', // Role 3's aiCostTracker tripped
  VALIDATION_FAILED: 'validation_failed', // Role 2's input schema rejected the request
  INTERNAL_ERROR: 'internal_server_error', // catch-all, never a raw stack trace
} as const;

export type AiErrorCode = (typeof AI_ERROR_CODES)[keyof typeof AI_ERROR_CODES];