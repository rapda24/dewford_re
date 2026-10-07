ALTER TABLE inquiries ADD COLUMN status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'contacting', 'scheduled', 'completed'));
