import { createRoute, z } from '@hono/zod-openapi'
import { ErrorSchema } from '../schemas/urls'
import { deleteByCode } from '../db/queries'
import type { OpenAPIHono } from '@hono/zod-openapi'

type Bindings = {
  DB: D1Database
  WORKER_URL: string
}

const route = createRoute({
  method: 'delete',
  path: '/api/links/{code}',
  tags: ['Links'],
  summary: 'Delete a short URL',
  request: {
    params: z.object({ code: z.string() }),
  },
  responses: {
    204: { description: 'Short URL deleted' },
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

export function registerDeleteLink(app: OpenAPIHono<{ Bindings: Bindings }>) {
  app.openapi(route, async (c) => {
    const { code } = c.req.valid('param')

    let deleted
    try {
      deleted = await deleteByCode(c.env.DB, code)
    } catch {
      return c.json({ error: 'Database error', code: 'DB_ERROR' }, 500)
    }

    if (!deleted) {
      return c.json({ error: 'Short code not found', code: 'NOT_FOUND' }, 404)
    }

    return new Response(null, { status: 204 })
  })
}
