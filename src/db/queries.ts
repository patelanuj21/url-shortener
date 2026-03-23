export type UrlRecord = {
  id: number
  short_code: string
  original_url: string
  created_at: string
  click_count: number
}

export async function findByCode(db: D1Database, shortCode: string): Promise<UrlRecord | null> {
  const result = await db
    .prepare('SELECT * FROM urls WHERE short_code = ?')
    .bind(shortCode)
    .first<UrlRecord>()
  return result ?? null
}

export async function createUrl(db: D1Database, shortCode: string, originalUrl: string): Promise<void> {
  await db
    .prepare('INSERT INTO urls (short_code, original_url) VALUES (?, ?)')
    .bind(shortCode, originalUrl)
    .run()
}

export async function incrementClickCount(db: D1Database, shortCode: string): Promise<void> {
  await db
    .prepare('UPDATE urls SET click_count = click_count + 1 WHERE short_code = ?')
    .bind(shortCode)
    .run()
}

export async function deleteByCode(db: D1Database, shortCode: string): Promise<boolean> {
  const result = await db
    .prepare('DELETE FROM urls WHERE short_code = ?')
    .bind(shortCode)
    .run()
  return (result.meta.changes ?? 0) > 0
}
