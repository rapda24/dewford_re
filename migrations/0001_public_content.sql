-- Public website content only. Do not store inquiries or private records here.
CREATE TABLE IF NOT EXISTS public_content (
  slug TEXT PRIMARY KEY,
  payload TEXT NOT NULL CHECK (json_valid(payload)),
  published INTEGER NOT NULL DEFAULT 0 CHECK (published IN (0, 1)),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
-- No demo content: subpages intentionally remain empty.
