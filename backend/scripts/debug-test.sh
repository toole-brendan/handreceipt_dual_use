#!/bin/bash

# Set environment to debug
export RUST_LOG=debug
export RUST_BACKTRACE=1

# Get the test name from argument
TEST_NAME=$1

if [ -z "$TEST_NAME" ]; then
    echo "Usage: $0 <test_name>"
    echo "Example: $0 blockchain"
    exit 1
fi

# Run the specific test with debug output
case $TEST_NAME in
    "blockchain")
        cargo test --package military-asset-tracking --test blockchain_test -- --nocapture
        ;;
    "mesh")
        cargo test --package military-asset-tracking --test mesh_test -- --nocapture
        ;;
    "offline")
        cargo test --package military-asset-tracking --test offline_test -- --nocapture
        ;;
    "rfid")
        cargo test --package military-asset-tracking --test rfid_test -- --nocapture
        ;;
    *)
        echo "Unknown test: $TEST_NAME"
        echo "Available tests: blockchain, mesh, offline, rfid"
        exit 1
        ;;
esac 