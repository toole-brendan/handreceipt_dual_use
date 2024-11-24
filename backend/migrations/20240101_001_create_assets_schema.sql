-- Enable PostGIS extension for location data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create enum types
CREATE TYPE property_status AS ENUM (
    'ACTIVE',
    'IN_TRANSIT',
    'INACTIVE',
    'PENDING',
    'ARCHIVED',
    'DELETED'
);

CREATE TYPE property_category AS ENUM (
    'EQUIPMENT',
    'SUPPLIES',
    'ELECTRONICS',
    'COMMUNICATIONS',
    'WEAPONS',
    'AMMUNITION',
    'TOOLS',
    'CLOTHING'
);

CREATE TYPE verification_method AS ENUM (
    'QR_CODE',
    'RFID_SCAN',
    'MANUAL_CHECK',
    'BLOCKCHAIN_VERIFICATION'
);

-- Create property table (renamed from assets)
CREATE TABLE property (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status property_status NOT NULL DEFAULT 'PENDING',
    category property_category NOT NULL,
    is_sensitive BOOLEAN NOT NULL DEFAULT false,
    nsn VARCHAR(255),                    -- National Stock Number
    serial_number VARCHAR(255),          -- Serial Number
    model_number VARCHAR(255),           -- Model Number
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    qr_code TEXT,
    rfid_tag_id VARCHAR(255),
    custodian VARCHAR(255),
    hand_receipt_number VARCHAR(255),    -- Reference to hand receipt
    sub_hand_receipt_number VARCHAR(255), -- For sub-hand receipts
    
    CONSTRAINT property_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT property_description_not_empty CHECK (length(trim(description)) > 0),
    CONSTRAINT property_quantity_positive CHECK (quantity > 0)
);

-- Create property locations table with PostGIS support
CREATE TABLE property_locations (
    id BIGSERIAL PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES property(id) ON DELETE CASCADE,
    location GEOGRAPHY(POINT) NOT NULL,
    altitude DOUBLE PRECISION,
    accuracy DOUBLE PRECISION,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    building VARCHAR(255),           -- Building number/name
    room VARCHAR(255),              -- Room number
    
    CONSTRAINT property_locations_valid_altitude CHECK (altitude IS NULL OR (altitude >= -1000 AND altitude <= 100000)),
    CONSTRAINT property_locations_valid_accuracy CHECK (accuracy IS NULL OR accuracy > 0)
);

-- Create property location history table
CREATE TABLE property_location_history (
    id BIGSERIAL PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES property(id) ON DELETE CASCADE,
    location GEOGRAPHY(POINT) NOT NULL,
    altitude DOUBLE PRECISION,
    accuracy DOUBLE PRECISION,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    building VARCHAR(255),
    room VARCHAR(255),
    
    CONSTRAINT property_location_history_valid_altitude CHECK (altitude IS NULL OR (altitude >= -1000 AND altitude <= 100000)),
    CONSTRAINT property_location_history_valid_accuracy CHECK (accuracy IS NULL OR accuracy > 0)
);

-- Create property metadata table
CREATE TABLE property_metadata (
    id BIGSERIAL PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES property(id) ON DELETE CASCADE,
    key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT property_metadata_unique_keys UNIQUE (property_id, key),
    CONSTRAINT property_metadata_key_not_empty CHECK (length(trim(key)) > 0)
);

-- Create property verifications table
CREATE TABLE property_verifications (
    id BIGSERIAL PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES property(id) ON DELETE CASCADE,
    verifier VARCHAR(255) NOT NULL,
    method verification_method NOT NULL,
    location GEOGRAPHY(POINT),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    condition_code VARCHAR(50),      -- Property condition at verification
    notes TEXT,
    
    CONSTRAINT property_verifications_verifier_not_empty CHECK (length(trim(verifier)) > 0)
);

-- Create hand receipts table
CREATE TABLE hand_receipts (
    id BIGSERIAL PRIMARY KEY,
    receipt_number VARCHAR(255) NOT NULL UNIQUE,
    custodian VARCHAR(255) NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    issued_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiration_date TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL,
    parent_receipt_number VARCHAR(255),  -- For sub-hand receipts
    digital_signature TEXT,
    notes TEXT
);

-- Create indexes
CREATE INDEX idx_property_status ON property(status);
CREATE INDEX idx_property_category ON property(category);
CREATE INDEX idx_property_is_sensitive ON property(is_sensitive);
CREATE INDEX idx_property_custodian ON property(custodian);
CREATE INDEX idx_property_nsn ON property(nsn);
CREATE INDEX idx_property_serial_number ON property(serial_number);
CREATE INDEX idx_property_rfid_tag_id ON property(rfid_tag_id);
CREATE INDEX idx_property_hand_receipt_number ON property(hand_receipt_number);

CREATE INDEX idx_property_locations_timestamp ON property_locations(timestamp);
CREATE INDEX idx_property_location_history_timestamp ON property_location_history(timestamp);
CREATE INDEX idx_property_verifications_timestamp ON property_verifications(timestamp);
CREATE INDEX idx_hand_receipts_receipt_number ON hand_receipts(receipt_number);
CREATE INDEX idx_hand_receipts_custodian ON hand_receipts(custodian);

-- Create spatial indexes
CREATE INDEX idx_property_locations_location ON property_locations USING GIST(location);
CREATE INDEX idx_property_location_history_location ON property_location_history USING GIST(location);
CREATE INDEX idx_property_verifications_location ON property_verifications USING GIST(location);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_property_updated_at
    BEFORE UPDATE ON property
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_metadata_updated_at
    BEFORE UPDATE ON property_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically archive location history
CREATE OR REPLACE FUNCTION archive_property_location()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.location IS DISTINCT FROM NEW.location THEN
        INSERT INTO property_location_history (
            property_id, location, altitude, accuracy, timestamp, building, room
        ) VALUES (
            OLD.property_id, OLD.location, OLD.altitude, OLD.accuracy, OLD.timestamp,
            OLD.building, OLD.room
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically archive location history
CREATE TRIGGER archive_property_location_trigger
    BEFORE UPDATE ON property_locations
    FOR EACH ROW
    EXECUTE FUNCTION archive_property_location();

-- Add comments
COMMENT ON TABLE property IS 'Stores military property items including sensitive items';
COMMENT ON COLUMN property.is_sensitive IS 'Indicates if this is a sensitive item requiring special handling';
COMMENT ON COLUMN property.nsn IS 'National Stock Number';
COMMENT ON COLUMN property.hand_receipt_number IS 'Reference to the hand receipt this property is assigned to';
