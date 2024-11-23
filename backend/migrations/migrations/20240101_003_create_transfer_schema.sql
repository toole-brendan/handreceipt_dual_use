-- Create enum types
CREATE TYPE transfer_status AS ENUM (
    'PENDING',
    'PENDING_APPROVAL',
    'APPROVED',
    'REJECTED',
    'COMPLETED',
    'CANCELLED'
);

CREATE TYPE verification_method AS ENUM (
    'QR_CODE',
    'MANUAL_CHECK',
    'BLOCKCHAIN'
);

CREATE TYPE property_condition AS ENUM (
    'SERVICEABLE',
    'UNSERVICEABLE',
    'NEEDS_REPAIR',
    'UNKNOWN'
);

-- Create transfers table
CREATE TABLE transfers (
    id UUID PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES property(id),
    from_custodian TEXT,
    to_custodian TEXT NOT NULL,
    status transfer_status NOT NULL,
    requires_approval BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    blockchain_verification TEXT,
    location_building TEXT,
    location_room TEXT,
    location_notes TEXT,
    location_grid TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    CONSTRAINT valid_custodians CHECK (from_custodian != to_custodian)
);

-- Create transfer signatures table
CREATE TABLE transfer_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id UUID NOT NULL REFERENCES transfers(id),
    signer_id TEXT NOT NULL,
    unit_code TEXT NOT NULL,
    role TEXT NOT NULL,
    signature BYTEA NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    CONSTRAINT unique_signer_per_transfer UNIQUE (transfer_id, signer_id)
);

-- Create property verifications table
CREATE TABLE property_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES property(id),
    verifier TEXT NOT NULL,
    method verification_method NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    location_building TEXT,
    location_room TEXT,
    location_notes TEXT,
    location_grid TEXT,
    condition_code property_condition,
    verification_notes TEXT
);

-- Create property locations table
CREATE TABLE property_locations (
    property_id UUID PRIMARY KEY REFERENCES property(id),
    building TEXT NOT NULL,
    room TEXT,
    grid_coordinates TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create property metadata table
CREATE TABLE property_metadata (
    property_id UUID NOT NULL REFERENCES property(id),
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (property_id, key)
);

-- Add indexes
CREATE INDEX idx_transfers_property ON transfers(property_id);
CREATE INDEX idx_transfers_custodians ON transfers(from_custodian, to_custodian);
CREATE INDEX idx_transfers_status ON transfers(status);
CREATE INDEX idx_transfer_signatures_transfer ON transfer_signatures(transfer_id);
CREATE INDEX idx_property_verifications_property ON property_verifications(property_id);
CREATE INDEX idx_property_verifications_timestamp ON property_verifications(timestamp);

-- Add audit triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_transfers_updated_at
    BEFORE UPDATE ON transfers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_property_metadata_updated_at
    BEFORE UPDATE ON property_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Add functions for common queries
CREATE OR REPLACE FUNCTION get_property_transfer_history(p_id UUID)
RETURNS TABLE (
    transfer_id UUID,
    from_custodian TEXT,
    to_custodian TEXT,
    status transfer_status,
    created_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    blockchain_verification TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.from_custodian,
        t.to_custodian,
        t.status,
        t.created_at,
        t.completed_at,
        t.blockchain_verification
    FROM transfers t
    WHERE t.property_id = p_id
    ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_pending_commander_approvals(unit_code TEXT)
RETURNS TABLE (
    transfer_id UUID,
    property_id UUID,
    from_custodian TEXT,
    to_custodian TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.property_id,
        t.from_custodian,
        t.to_custodian,
        t.created_at
    FROM transfers t
    JOIN property p ON t.property_id = p.id
    WHERE t.status = 'PENDING_APPROVAL'
    AND t.requires_approval = true
    AND p.unit = unit_code
    ORDER BY t.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE transfers IS 'Records of property transfers between custodians';
COMMENT ON TABLE transfer_signatures IS 'Digital signatures for transfer verification';
COMMENT ON TABLE property_verifications IS 'Record of property verifications';
COMMENT ON TABLE property_locations IS 'Current location of property items';
COMMENT ON TABLE property_metadata IS 'Additional property attributes';

COMMENT ON COLUMN transfers.blockchain_verification IS 'Hash or ID of blockchain record';
COMMENT ON COLUMN transfer_signatures.signature IS 'Ed25519 digital signature';
COMMENT ON COLUMN property_verifications.method IS 'Method used for verification';
COMMENT ON COLUMN property_locations.grid_coordinates IS 'Military grid reference system coordinates';
