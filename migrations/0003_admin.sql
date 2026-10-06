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
