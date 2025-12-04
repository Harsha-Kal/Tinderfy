ALTER TABLE matches DROP CONSTRAINT matches_pkey;
ALTER TABLE matches DROP COLUMN id;
ALTER TABLE matches
    ADD PRIMARY KEY (user1_id, user2_id);
ALTER TABLE matches
    ADD CONSTRAINT user_order CHECK (user1_id < user2_id);
ALTER TABLE matches
    ADD COLUMN IF NOT EXISTS matched BOOLEAN DEFAULT FALSE;
ALTER TABLE matches
    ADD COLUMN IF NOT EXISTS initiated_by_user_id INTEGER;