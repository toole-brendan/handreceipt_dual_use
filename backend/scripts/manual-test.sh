#!/bin/bash

# Start the backend server
cargo run &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Test asset creation with NFT
echo "Testing asset creation..."
curl -X POST http://localhost:8080/api/assets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Asset",
    "description": "Test Description",
    "metadata": {
      "serial_number": "TEST-123"
    }
  }'

# Store the asset ID
ASSET_ID=$(curl http://localhost:8080/api/assets | jq -r '.[0].id')

# Test property transfer
echo "Testing property transfer..."
curl -X POST "http://localhost:8080/api/assets/${ASSET_ID}/transfer" \
  -H "Content-Type: application/json" \
  -d '{
    "to_custodian": "new-owner-id",
    "hand_receipt": "Digital hand receipt content",
    "notes": "Test transfer"
  }'

# Test QR code verification
echo "Testing QR verification..."
curl -X POST "http://localhost:8080/api/assets/${ASSET_ID}/verify" \
  -H "Content-Type: application/json" \
  -d '{
    "qr_code": "test-qr-code"
  }'

# Test RFID operations
echo "Testing RFID operations..."
curl -X POST "http://localhost:8080/api/assets/${ASSET_ID}/rfid/associate" \
  -H "Content-Type: application/json" \
  -d '{
    "tag_id": "TEST-RFID-123"
  }'

# Cleanup
kill $SERVER_PID 