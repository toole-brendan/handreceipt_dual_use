#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🧪 Starting comprehensive test suite..."

# Clean and build
echo -e "\n${GREEN}1. Cleaning and building project...${NC}"
cargo clean
cargo build

# Run unit tests
echo -e "\n${GREEN}2. Running unit tests...${NC}"
cargo test -- --nocapture

# Run specific test suites
echo -e "\n${GREEN}3. Running NFT property tests...${NC}"
cargo test test_nft_property_lifecycle -- --nocapture

echo -e "\n${GREEN}4. Running mesh network tests...${NC}"
cargo test test_mesh_network_property_transfer -- --nocapture

echo -e "\n${GREEN}5. Running offline operation tests...${NC}"
cargo test test_offline_operations -- --nocapture

echo -e "\n${GREEN}6. Running RFID tests...${NC}"
cargo test test_rfid_operations -- --nocapture
cargo test test_rfid_batch_operations -- --nocapture

# Run integration tests with coverage
echo -e "\n${GREEN}7. Running integration tests with coverage...${NC}"
cargo install cargo-tarpaulin
cargo tarpaulin --out Html

echo -e "\n${GREEN}Test suite completed!${NC}" 