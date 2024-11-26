-- Create property_category enum
CREATE TYPE property_category AS ENUM (
    'equipment',
    'weapon',
    'vehicle',
    'supply'
);

-- Create property_status enum
CREATE TYPE property_status AS ENUM (
    'available',
    'in_transfer',
    'maintenance',
    'lost'
);

-- Create transfer_status enum
CREATE TYPE transfer_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'completed',
    'cancelled'
);

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create properties table
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category property_category NOT NULL,
    status property_status NOT NULL DEFAULT 'available',
    location JSONB NOT NULL,
    current_holder_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    serial_number VARCHAR(100),
    nsn VARCHAR(100),
    hand_receipt_number VARCHAR(100),
    requires_approval BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Create transfers table
CREATE TABLE transfers (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL,
    from_holder_id INTEGER NOT NULL,
    to_holder_id INTEGER NOT NULL,
    status transfer_status NOT NULL DEFAULT 'pending',
    location JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by_id INTEGER,
    notes TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Create audit_log table
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    user_id INTEGER,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
); 