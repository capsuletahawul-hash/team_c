import axios from 'axios';
import type { AiMessage } from '../types/ai.js';

/**
 * The ONE place in the codebase that knows we're calling OpenRouter.
 * services/aiService.ts (Role 2) only ever calls complete(messages, options)
 * and never touches axios, headers, or OpenRouter's request/response shape
 * directly — same discipline as lib/moyasar.ts for the payment gateway.
 *
 * Swapping providers later means editing this file only.
 */

const AI_API_URL = process.env.AI_API_URL || '';
const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_MODEL = process.env.AI_MODEL || 'openai/gpt-4o-mini';
const AI_REQUEST_TIMEOUT_MS = Number(process.env.AI_REQUEST_TIMEOUT_MS) || 15000;

if (!AI_API_URL) {
  console.warn('⚠️ AI_API_URL is not defined in .env');
}
if (!AI_API_KEY) {
  console.warn('⚠️ AI_API_KEY is not defined in .env');
}

const aiHttp = axios.create({
  baseURL: AI_API_URL,
  timeout: AI_REQUEST_TIMEOUT_MS,
  headers: {
    Authorization: `Bearer ${AI_API_KEY}`,
    'Content-Type': 'application/json',
    // OpenRouter-recommended (not required) attribution headers.
    'HTTP-Referer': process.env.APP_URL || 'http://localhost:5000',
    'X-Title': 'Capsule Tahawul - Course Assistant',
  },
});

export interface AiCompleteOptions {
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export interface AiCompleteResult {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** Full provider response, kept around for debugging / future streaming work. */
  raw: unknown;
}

/**
 * Calls the LLM. Throws Error with one of the AI_ERROR_CODES strings
 * (from types/ai.ts) on failure — never lets a raw axios/provider error
 * bubble up, so the controller (Role 4) always has something clean to map
 * to { success: false, error }.
 */
export async function complete(
  messages: AiMessage[],
  options: AiCompleteOptions = {}
): Promise<AiCompleteResult> {
  if (!AI_API_URL || !AI_API_KEY) {
    throw new Error('ai_not_configured');
  }

  const candidateModels = [
    options.model || process.env.AI_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemini-2.0-flash-lite-preview-02-05:free',
    'openai/gpt-4o-mini',
    'deepseek/deepseek-chat',
    'qwen/qwen-2.5-coder-32b-instruct'
  ];

  let lastError: any = null;

  for (const modelCandidate of candidateModels) {
    try {
      const response = await aiHttp.post('/chat/completions', {
        model: modelCandidate,
        messages,
        max_tokens: options.maxTokens ?? 500,
        temperature: options.temperature ?? 0.3,
      });

      const choice = response.data?.choices?.[0];
      const content = choice?.message?.content;

      if (typeof content !== 'string') {
        console.error(`[AI CLIENT] Model ${modelCandidate} returned unexpected response shape:`, response.data);
        continue;
      }

      const usage = response.data?.usage || {};

      return {
        content,
        usage: {
          promptTokens: usage.prompt_tokens ?? 0,
          completionTokens: usage.completion_tokens ?? 0,
          totalTokens: usage.total_tokens ?? 0,
        },
        raw: response.data,
      };
    } catch (err: any) {
      lastError = err;
      const status = err?.response?.status || err?.response?.data?.error?.code;
      const message = err?.response?.data?.error?.message || err.message;
      console.warn(`[AI CLIENT WARN] Model '${modelCandidate}' failed (HTTP ${status}: ${message}). Trying next fallback model...`);
    }
  }

  console.error('[AI CLIENT ERROR]: All candidate models failed.', lastError?.response?.data || lastError?.message);
  throw new Error('ai_provider_error');
}