-- Add transfer status enum
CREATE TYPE transfer_status AS ENUM (
    'PENDING',
    'COMPLETED',
    'REJECTED',
    'REQUIRES_APPROVAL',
    'APPROVED',
    'CANCELLED'
);

-- Create property transfers table
CREATE TABLE property_transfers (
    id UUID PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES property(id) ON DELETE CASCADE,
    from_custodian VARCHAR(255),
    to_custodian VARCHAR(255) NOT NULL,
    verifier VARCHAR(255) NOT NULL,
    status transfer_status NOT NULL DEFAULT 'PENDING',
    initiated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    qr_scan_location GEOGRAPHY(POINT),
    building VARCHAR(255),
    room VARCHAR(255),
    hand_receipt_number VARCHAR(255),
    requires_approval BOOLEAN NOT NULL DEFAULT false,
    commander_id VARCHAR(255),
    commander_notes TEXT,
    transfer_notes TEXT,
    
    CONSTRAINT property_transfers_custodian_change CHECK (from_custodian != to_custodian)
);

-- Create QR code scans table to track all scans
CREATE TABLE qr_code_scans (
    id UUID PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES property(id) ON DELETE CASCADE,
    scanned_by VARCHAR(255) NOT NULL,
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    scan_location GEOGRAPHY(POINT),
    building VARCHAR(255),
    room VARCHAR(255),
    scan_type VARCHAR(50) NOT NULL, -- 'TRANSFER', 'INVENTORY', 'VERIFICATION'
    transfer_id UUID REFERENCES property_transfers(id),
    device_info JSONB,
    scan_notes TEXT
);

-- Create property transfer approvals table
CREATE TABLE transfer_approvals (
    id UUID PRIMARY KEY,
    transfer_id UUID NOT NULL REFERENCES property_transfers(id) ON DELETE CASCADE,
    approver_id VARCHAR(255) NOT NULL,
    approved_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approval_type VARCHAR(50) NOT NULL, -- 'COMMANDER', 'SUPPLY', 'OTHER'
    approved BOOLEAN NOT NULL,
    notes TEXT,
    location GEOGRAPHY(POINT),
    device_info JSONB
);

-- Create property custody history table
CREATE TABLE property_custody_history (
    id UUID PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES property(id) ON DELETE CASCADE,
    custodian VARCHAR(255) NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL,
    released_at TIMESTAMPTZ,
    assigned_by VARCHAR(255) NOT NULL,
    hand_receipt_number VARCHAR(255),
    transfer_id UUID REFERENCES property_transfers(id),
    notes TEXT
);

-- Add indexes
CREATE INDEX idx_property_transfers_property_id ON property_transfers(property_id);
CREATE INDEX idx_property_transfers_from_custodian ON property_transfers(from_custodian);
CREATE INDEX idx_property_transfers_to_custodian ON property_transfers(to_custodian);
CREATE INDEX idx_property_transfers_status ON property_transfers(status);
CREATE INDEX idx_property_transfers_initiated_at ON property_transfers(initiated_at);
CREATE INDEX idx_property_transfers_requires_approval ON property_transfers(requires_approval);

CREATE INDEX idx_qr_code_scans_property_id ON qr_code_scans(property_id);
CREATE INDEX idx_qr_code_scans_scanned_by ON qr_code_scans(scanned_by);
CREATE INDEX idx_qr_code_scans_scanned_at ON qr_code_scans(scanned_at);
CREATE INDEX idx_qr_code_scans_transfer_id ON qr_code_scans(transfer_id);

CREATE INDEX idx_transfer_approvals_transfer_id ON transfer_approvals(transfer_id);
CREATE INDEX idx_transfer_approvals_approver_id ON transfer_approvals(approver_id);

CREATE INDEX idx_property_custody_history_property_id ON property_custody_history(property_id);
CREATE INDEX idx_property_custody_history_custodian ON property_custody_history(custodian);
CREATE INDEX idx_property_custody_history_assigned_at ON property_custody_history(assigned_at);

-- Create spatial indexes
CREATE INDEX idx_property_transfers_qr_scan_location ON property_transfers USING GIST(qr_scan_location);
CREATE INDEX idx_qr_code_scans_scan_location ON qr_code_scans USING GIST(scan_location);
CREATE INDEX idx_transfer_approvals_location ON transfer_approvals USING GIST(location);

-- Create function to maintain custody history
CREATE OR REPLACE FUNCTION maintain_custody_history()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is a new transfer or status changed to COMPLETED
    IF (TG_OP = 'INSERT' OR 
        (TG_OP = 'UPDATE' AND OLD.status != 'COMPLETED' AND NEW.status = 'COMPLETED'))
    THEN
        -- Close previous custody record
        UPDATE property_custody_history
        SET released_at = NEW.completed_at
        WHERE property_id = NEW.property_id
        AND custodian = NEW.from_custodian
        AND released_at IS NULL;

        -- Create new custody record
        INSERT INTO property_custody_history (
            id,
            property_id,
            custodian,
            assigned_at,
            assigned_by,
            hand_receipt_number,
            transfer_id,
            notes
        ) VALUES (
            gen_random_uuid(),
            NEW.property_id,
            NEW.to_custodian,
            NEW.completed_at,
            NEW.verifier,
            NEW.hand_receipt_number,
            NEW.id,
            NEW.transfer_notes
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for custody history
CREATE TRIGGER maintain_custody_history_trigger
    AFTER INSERT OR UPDATE ON property_transfers
    FOR EACH ROW
    EXECUTE FUNCTION maintain_custody_history();

-- Add comments
COMMENT ON TABLE property_transfers IS 'Records all property transfer transactions';
COMMENT ON TABLE qr_code_scans IS 'Tracks all QR code scans for property items';
COMMENT ON TABLE transfer_approvals IS 'Records approvals for property transfers';
COMMENT ON TABLE property_custody_history IS 'Maintains history of property custody';
