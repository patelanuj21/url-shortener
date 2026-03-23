import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
  WORKER_URL: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/api/health', (c) => {
  return c.json({ message: 'URL Shortener API', status: 'ok', version: '0.1.0' })
})

export default app
