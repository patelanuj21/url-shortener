import { createRoute } from '@hono/zod-openapi'
import { ShortenRequestSchema, ShortenResponseSchema, ErrorSchema } from '../schemas/urls'
import { findByCode, createUrl } from '../db/queries'
import type { OpenAPIHono } from '@hono/zod-openapi'

type Bindings = {
  DB: D1Database
  WORKER_URL: string
}

function generateShortCode(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes).map((b) => chars[b % chars.length]).join('')
}

const route = createRoute({
  method: 'post',
  path: '/api/shorten',
  tags: ['Links'],
  summary: 'Create a short URL',
  request: {
    body: {
      content: { 'application/json': { schema: ShortenRequestSchema } },
      required: true,
    },
  },
  responses: {
    201: {
      content: { 'application/json': { schema: ShortenResponseSchema } },
      description: 'Short URL created',
    },
    409: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Custom short code already exists',
    },
    422: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Validation error',
    },
    500: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Database error',
    },
  },
})

export function registerShorten(app: OpenAPIHono<{ Bindings: Bindings }>) {
  app.openapi(route, async (c) => {
    const { url, custom_code } = c.req.valid('json')

    const shortCode = custom_code ?? generateShortCode()

    // Check for collision on custom codes
    if (custom_code) {
      const existing = await findByCode(c.env.DB, shortCode).catch(() => null)
      if (existing) {
        return c.json({ error: 'Short code already exists', code: 'CODE_CONFLICT' }, 409)
      }
    }

    try {
      await createUrl(c.env.DB, shortCode, url)
    } catch (err) {
      // D1 unique constraint — auto-generated code collided (rare), or DB error
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('UNIQUE')) {
        return c.json({ error: 'Short code already exists', code: 'CODE_CONFLICT' }, 409)
      }
      return c.json({ error: 'Failed to create short URL', code: 'DB_ERROR' }, 500)
    }

    const shortUrl = `${c.env.WORKER_URL}/${shortCode}`
    return c.json({ short_code: shortCode, short_url: shortUrl, original_url: url }, 201)
  })
}
