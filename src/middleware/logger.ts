import type { MiddlewareHandler } from 'hono'

export const requestLogger = (): MiddlewareHandler => {
  return async (c, next) => {
    const start = Date.now()
    const requestId = crypto.randomUUID()

    await next()

    const log: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      request_id: requestId,
      method: c.req.method,
      path: new URL(c.req.url).pathname,
      status: c.res.status,
      duration_ms: Date.now() - start,
    }

    // Include error details for non-2xx responses
    if (c.res.status >= 400) {
      try {
        const body = await c.res.clone().json<{ error?: string; code?: string }>()
        if (body.error) log.error = body.error
        if (body.code) log.error_code = body.code
      } catch {
        // response body wasn't JSON — skip error fields
      }
    }

    console.log(JSON.stringify(log))
  }
}
