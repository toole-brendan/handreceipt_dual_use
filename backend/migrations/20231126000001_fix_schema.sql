-- Add missing columns and fix references

-- Add missing columns to properties table
ALTER TABLE properties
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS is_sensitive BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;

-- Fix foreign key references in properties
ALTER TABLE properties
    DROP CONSTRAINT IF EXISTS properties_current_holder_id_fkey,
    ADD CONSTRAINT properties_current_holder_id_fkey 
        FOREIGN KEY (current_holder_id) 
        REFERENCES users(id);

-- Fix foreign key references in transfers
ALTER TABLE transfers
    DROP CONSTRAINT IF EXISTS transfers_from_holder_id_fkey,
    DROP CONSTRAINT IF EXISTS transfers_to_holder_id_fkey,
    DROP CONSTRAINT IF EXISTS transfers_approved_by_id_fkey,
    ADD CONSTRAINT transfers_from_holder_id_fkey 
        FOREIGN KEY (from_holder_id) 
        REFERENCES users(id),
    ADD CONSTRAINT transfers_to_holder_id_fkey 
        FOREIGN KEY (to_holder_id) 
        REFERENCES users(id),
    ADD CONSTRAINT transfers_approved_by_id_fkey 
        FOREIGN KEY (approved_by_id) 
        REFERENCES users(id);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_current_holder 
    ON properties(current_holder_id);
CREATE INDEX IF NOT EXISTS idx_transfers_property 
    ON transfers(property_id);
CREATE INDEX IF NOT EXISTS idx_transfers_from_holder 
    ON transfers(from_holder_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to_holder 
    ON transfers(to_holder_id); 