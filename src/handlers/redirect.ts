import { createRoute, z } from '@hono/zod-openapi'
import { ErrorSchema } from '../schemas/urls'
import { findByCode, incrementClickCount } from '../db/queries'
import type { OpenAPIHono } from '@hono/zod-openapi'
import type { Bindings } from '../types'

const route = createRoute({
  method: 'get',
  path: '/{code}',
  tags: ['Links'],
  summary: 'Redirect to original URL',
  description: 'Returns a 302 redirect to the original URL and increments the click counter. Open directly in a browser — cannot be tested via Swagger UI due to CORS on the redirect destination.',
  request: {
    params: z.object({ code: z.string() }),
  },
  responses: {
    302: { description: 'Redirect to original URL' },
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

export function registerRedirect(app: OpenAPIHono<{ Bindings: Bindings }>) {
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

    // Fire-and-forget click count increment
    c.executionCtx.waitUntil(incrementClickCount(c.env.DB, code))

    return c.redirect(record.original_url, 302)
  })
}
