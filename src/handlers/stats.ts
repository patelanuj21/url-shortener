import { createRoute, z } from '@hono/zod-openapi'
import { StatsResponseSchema, ErrorSchema } from '../schemas/urls'
import { findByCode } from '../db/queries'
import type { OpenAPIHono } from '@hono/zod-openapi'

type Bindings = {
  DB: D1Database
  WORKER_URL: string
}

const route = createRoute({
  method: 'get',
  path: '/api/stats/{code}',
  tags: ['Links'],
  summary: 'Get stats for a short URL',
  request: {
    params: z.object({ code: z.string() }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: StatsResponseSchema } },
      description: 'Stats for the short URL',
    },
    404: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Short code not found',
    },
    500: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Database error',
    },
  },
})

export function registerStats(app: OpenAPIHono<{ Bindings: Bindings }>) {
  app.openapi(route, async (c) => {
    const { code } = c.req.valid('param')

    let record
    try {
      record = await findByCode(c.env.DB, code)
    } catch {
      return c.json({ error: 'Database error', code: 'DB_ERROR' }, 500)
    }

    if (!record) {
      return c.json({ error: 'Short code not found', code: 'NOT_FOUND' }, 404)
    }

    return c.json({
      short_code: record.short_code,
      original_url: record.original_url,
      click_count: record.click_count,
      created_at: record.created_at,
    }, 200)
  })
}
