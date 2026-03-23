import { OpenAPIHono } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import { requestLogger } from './middleware/logger'
import { registerShorten } from './handlers/shorten'
import { registerRedirect } from './handlers/redirect'
import { registerStats } from './handlers/stats'
import { registerDeleteLink } from './handlers/deleteLink'

type Bindings = {
  DB: D1Database
  WORKER_URL: string
}

const app = new OpenAPIHono<{ Bindings: Bindings }>()

app.use('*', requestLogger())

registerShorten(app)
registerStats(app)
registerDeleteLink(app)
registerRedirect(app)

// Health check
app.get('/api/health', (c) => {
  return c.json({ message: 'URL Shortener API', status: 'ok', version: '0.1.0' })
})

// OpenAPI spec
app.doc('/api/openapi.json', {
  openapi: '3.0.0',
  info: {
    title: 'URL Shortener API',
    version: '1.0.0',
    description: 'Serverless URL shortener built on Cloudflare Workers + D1',
  },
})

// Swagger UI
app.get('/api/docs', swaggerUI({ url: '/api/openapi.json' }))

export default app
