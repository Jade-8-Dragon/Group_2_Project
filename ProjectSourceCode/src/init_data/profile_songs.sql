ALTER TABLE musician_profiles
    ADD COLUMN IF NOT EXISTS song_links TEXT[] NOT NULL DEFAULT '{}'
        CHECK (cardinality(song_links) <= 3);
