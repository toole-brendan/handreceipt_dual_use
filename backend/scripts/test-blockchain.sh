#!/bin/bash
# test-blockchain.sh

# Set environment variables
export RUST_LOG=debug
export RUST_BACKTRACE=1

# Add authentication token
AUTH_TOKEN="test-token"

# Add these headers to all requests
COMMON_HEADERS=(
    -H "Content-Type: application/json"
    -H "Authorization: Bearer test-token"
    -H "X-User-ID: $(uuidgen)"
)

# Wait for server to be ready
echo "Waiting for server to be ready..."
max_attempts=30
attempt=1
while ! curl -s http://localhost:8080/health > /dev/null; do
    if [ $attempt -eq $max_attempts ]; then
        echo "Server failed to start after $max_attempts attempts"
        exit 1
    fi
    echo "Attempt $attempt: Server not ready, waiting..."
    sleep 1
    ((attempt++))
done

echo "Server is ready. Starting tests..."

echo "Testing NFT Property Token Creation..."
RESPONSE=$(curl -v -X POST "http://localhost:8080/api/assets" \
    "${COMMON_HEADERS[@]}" \
    -d '{
        "name": "Test NFT Asset",
        "description": "Blockchain Test Asset",
        "metadata": {
            "serial_number": "NFT-TEST-123"
        },
        "classification": "UNCLASSIFIED"
    }' 2>&1)

# Check HTTP status code
if ! echo "$RESPONSE" | grep -q "HTTP/1.1 201"; then
    echo "Error: Unexpected HTTP status code"
    echo "Full response:"
    echo "$RESPONSE"
    exit 1
fi

# Extract the response body (everything after the blank line)
BODY=$(echo "$RESPONSE" | sed -n -e '/^$/,$p' | tail -n +2)

# Parse asset ID from response body
ASSET_ID=$(echo "$BODY" | jq -r '.id')
if [ -z "$ASSET_ID" ] || [ "$ASSET_ID" = "null" ]; then
    echo "Failed to get asset ID from response"
    echo "Response body was:"
    echo "$BODY"
    exit 1
fi

echo "Created asset with ID: $ASSET_ID"

echo "Testing Property Transfer..."
TRANSFER_RESPONSE=$(curl -X POST "http://localhost:8080/api/assets/${ASSET_ID}/transfer" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "to_custodian": "new-owner-id",
    "hand_receipt": "Test Hand Receipt",
    "notes": "Blockchain transfer test"
  }')

if [ $? -ne 0 ]; then
    echo "Error transferring asset"
    echo "Response was: $TRANSFER_RESPONSE"
    exit 1
fi

echo "Verifying Transfer on Blockchain..."
VERIFY_RESPONSE=$(curl -X GET "http://localhost:8080/api/assets/${ASSET_ID}/verify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}")

if [ $? -ne 0 ]; then
    echo "Error verifying transfer"
    echo "Response was: $VERIFY_RESPONSE"
    exit 1
fi

echo "Testing Blockchain Status..."
STATUS_RESPONSE=$(curl -X GET "http://localhost:8080/api/blockchain/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}")

if [ $? -ne 0 ]; then
    echo "Error getting blockchain status"
    echo "Response was: $STATUS_RESPONSE"
    exit 1
fi

echo "All tests completed successfully" 