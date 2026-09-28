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
