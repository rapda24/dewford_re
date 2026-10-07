-- Initialize required tables without deleting existing data.

-- Public website content only. Do not store inquiries or private records here.
CREATE TABLE IF NOT EXISTS public_content (
  slug TEXT PRIMARY KEY,
  payload TEXT NOT NULL CHECK (json_valid(payload)),
  published INTEGER NOT NULL DEFAULT 0 CHECK (published IN (0, 1)),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
-- No demo content: subpages intentionally remain empty.


-- Private consultation requests. Never returned by the public content endpoint.
CREATE TABLE IF NOT EXISTS inquiries (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 phone TEXT NOT NULL,
 email TEXT NOT NULL DEFAULT '',
 program TEXT NOT NULL,
 message TEXT NOT NULL DEFAULT '',
 consent INTEGER NOT NULL CHECK (consent = 1),
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);


CREATE TABLE IF NOT EXISTS admin_sessions (
 token_hash TEXT PRIMARY KEY,
 csrf TEXT NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS admin_login_limits (
 bucket TEXT PRIMARY KEY,
 attempts INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS admin_content (
 id INTEGER PRIMARY KEY CHECK (id = 1),
 revision INTEGER NOT NULL,
 payload TEXT NOT NULL CHECK (json_valid(payload))
);


-- Image storage for the Workers/D1 Free plan. No R2 subscription is required.
CREATE TABLE IF NOT EXISTS admin_media (
  key TEXT PRIMARY KEY,
  content_type TEXT NOT NULL,
  data BLOB NOT NULL,
  byte_size INTEGER NOT NULL CHECK (byte_size > 0 AND byte_size <= 1000000),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
