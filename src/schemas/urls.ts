import { z } from '@hono/zod-openapi'

export const ShortenRequestSchema = z.object({
  url: z
    .string()
    .url()
    .openapi({ example: 'https://cloudflare.com' }),
  custom_code: z
    .string()
    .regex(/^[a-zA-Z0-9_-]{3,20}$/, 'Must be 3-20 characters: letters, numbers, hyphens, underscores')
    .optional()
    .openapi({ example: 'cf-docs' }),
})

export const ShortenResponseSchema = z.object({
  short_code: z.string().openapi({ example: 'abc123' }),
  short_url: z.string().url().openapi({ example: 'https://url-shortener.demos.anujpatel.net/abc123' }),
  original_url: z.string().url().openapi({ example: 'https://cloudflare.com' }),
})

export const StatsResponseSchema = z.object({
  short_code: z.string().openapi({ example: 'abc123' }),
  original_url: z.string().url().openapi({ example: 'https://cloudflare.com' }),
  click_count: z.number().int().openapi({ example: 42 }),
  created_at: z.string().openapi({ example: '2026-03-22T10:00:00.000Z' }),
})

export const ErrorSchema = z.object({
  error: z.string().openapi({ example: 'Short code not found' }),
  code: z.string().openapi({ example: 'NOT_FOUND' }),
})
