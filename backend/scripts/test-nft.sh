#!/bin/bash

# Start local test environment
echo "Starting test environment..."

# Run database migrations
cargo run --bin backend -- migrate

# Run integration tests
echo "Running NFT integration tests..."
cargo test --test integration_test -- --nocapture

# Run specific test
echo "Running NFT property lifecycle test..."
cargo test test_nft_property_lifecycle -- --nocapture

# Cleanup
echo "Cleaning up test environment..." 