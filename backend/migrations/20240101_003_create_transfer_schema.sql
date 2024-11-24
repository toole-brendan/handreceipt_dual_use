-- Create transfer signatures table
CREATE TABLE transfer_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id UUID NOT NULL REFERENCES property_transfers(id),
    signer_id TEXT NOT NULL,
    unit_code TEXT NOT NULL,
    role TEXT NOT NULL,
    signature BYTEA NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    CONSTRAINT unique_signer_per_transfer UNIQUE (transfer_id, signer_id)
);

-- Add indexes
CREATE INDEX idx_transfer_signatures_transfer ON transfer_signatures(transfer_id);

-- Add functions for common queries
CREATE OR REPLACE FUNCTION get_property_transfer_history(p_id UUID)
RETURNS TABLE (
    transfer_id UUID,
    from_custodian VARCHAR(255),
    to_custodian VARCHAR(255),
    status transfer_status,
    initiated_at TIMESTAMPTZ,
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
        t.initiated_at,
        t.completed_at,
        t.transfer_notes as blockchain_verification
    FROM property_transfers t
    WHERE t.property_id = p_id
    ORDER BY t.initiated_at DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_pending_commander_approvals(unit_code TEXT)
RETURNS TABLE (
    transfer_id UUID,
    property_id UUID,
    from_custodian VARCHAR(255),
    to_custodian VARCHAR(255),
    initiated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.property_id,
        t.from_custodian,
        t.to_custodian,
        t.initiated_at
    FROM property_transfers t
    WHERE t.status = 'REQUIRES_APPROVAL'
    AND t.requires_approval = true
    AND t.commander_id IS NULL
    ORDER BY t.initiated_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE transfer_signatures IS 'Digital signatures for transfer verification';
COMMENT ON COLUMN transfer_signatures.signature IS 'Ed25519 digital signature';
