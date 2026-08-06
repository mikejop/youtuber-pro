import DOMPurify from 'dompurify';
import { z } from 'zod';

/**
 * Security & Input Validation Helper Module
 */

/**
 * 1. XSS Sanitization Helper
 * Sanitizes user-provided string or HTML content before rendering or processing.
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}

/**
 * 2. Zod Validation Schemas
 */
export const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'O nome deve ter no mínimo 2 caracteres.')
    .max(50, 'O nome deve ter no máximo 50 caracteres.')
    .trim(),
  email: z.string().email('Endereço de e-mail inválido.').lowercase().trim(),
});

export const checkoutSchema = z.object({
  planId: z.string().min(1, 'ID do plano é obrigatório.').trim(),
  email: z.string().email('E-mail inválido.').optional(),
});

/**
 * 3. Client-Side Anti-Spam Rate Limiter
 * Prevents rapid brute-force clicks on login, checkout, and form submission buttons.
 */
class ClientRateLimiter {
  private timestamps: Map<string, number[]> = new Map();

  isRateLimited(key: string, maxRequests: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;

    const requestTimes = (this.timestamps.get(key) || []).filter((time) => time > windowStart);
    requestTimes.push(now);
    this.timestamps.set(key, requestTimes);

    return requestTimes.length > maxRequests;
  }
}

export const rateLimiter = new ClientRateLimiter();
