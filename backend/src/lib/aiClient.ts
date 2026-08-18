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

  try {
    const response = await aiHttp.post('/chat/completions', {
      model: options.model || AI_MODEL,
      messages,
      max_tokens: options.maxTokens ?? 500,
      temperature: options.temperature ?? 0.3,
    });

    const choice = response.data?.choices?.[0];
    const content = choice?.message?.content;

    // Defensive: even the "shape" of a successful HTTP response isn't
    // guaranteed. If OpenRouter's payload doesn't look like we expect,
    // treat it as a provider problem rather than handing undefined
    // upstream (Handbook Ch. 08 — never trust it blindly).
    if (typeof content !== 'string') {
      console.error('[AI CLIENT] unexpected response shape:', response.data);
      throw new Error('ai_provider_error');
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
    if (err instanceof Error && err.message === 'ai_provider_error') {
      throw err;
    }

    if (err.code === 'ECONNABORTED') {
      console.error('[AI CLIENT] request timed out after', AI_REQUEST_TIMEOUT_MS, 'ms');
      throw new Error('ai_timeout');
    }

    console.error('[AI CLIENT ERROR]:', err?.response?.data || err.message);
    throw new Error('ai_provider_error');
  }
}