ALTER TABLE inquiries ADD COLUMN site TEXT NOT NULL DEFAULT 'ko' CHECK (site IN ('ko', 'en'));
