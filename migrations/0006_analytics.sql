CREATE TABLE IF NOT EXISTS site_visits (
 day TEXT NOT NULL, visitor TEXT NOT NULL, path TEXT NOT NULL,
 device TEXT NOT NULL CHECK(device IN ('mobile','desktop')),
 views INTEGER NOT NULL DEFAULT 1,
 PRIMARY KEY(day, visitor, path, device)
);
