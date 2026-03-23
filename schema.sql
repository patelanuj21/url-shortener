CREATE TABLE IF NOT EXISTS urls (
  id           INTEGER  PRIMARY KEY AUTOINCREMENT,
  short_code   TEXT     UNIQUE NOT NULL,
  original_url TEXT     NOT NULL,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  click_count  INTEGER  DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_short_code ON urls(short_code);
