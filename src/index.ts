import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import { requestLogger } from './middleware/logger'
import { registerShorten } from './handlers/shorten'
import { registerRedirect } from './handlers/redirect'
import { registerStats } from './handlers/stats'
import { registerDeleteLink } from './handlers/deleteLink'
import { HealthResponseSchema } from './schemas/urls'
import type { Bindings } from './types'

const app = new OpenAPIHono<{ Bindings: Bindings }>({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Validation error', code: 'VALIDATION_ERROR' }, 422)
    }
  },
})

app.use('*', requestLogger())

registerShorten(app)
registerStats(app)
registerDeleteLink(app)
registerRedirect(app)

// Health check
app.openapi(createRoute({
  method: 'get',
  path: '/api/health',
  tags: ['System'],
  summary: 'Health check',
  responses: {
    200: {
      content: { 'application/json': { schema: HealthResponseSchema } },
      description: 'Service is healthy',
    },
  },
}), (c) => {
  return c.json({ message: 'URL Shortener API', status: 'ok', version: '0.1.0' }, 200)
})

// OpenAPI spec
app.doc('/api/openapi.json', {
  openapi: '3.0.0',
  info: {
    title: 'URL Shortener API',
    version: '1.0.0',
    description: `Serverless URL shortener built on Cloudflare Workers + D1.

> **Note on \`GET /{code}\`:** This endpoint returns a 302 redirect and must be opened directly in a browser or tested with \`curl -L\`. Swagger UI cannot follow redirects to external domains due to browser CORS restrictions — the "Failed to fetch" message is expected behaviour, not a bug.`,
  },
})

// Swagger UI
app.get('/api/docs', swaggerUI({ url: '/api/openapi.json' }))

export default app
