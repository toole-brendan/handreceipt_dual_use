#!/bin/bash

# Run all tests with specific features
cargo test --all-features -- --nocapture

# Run specific test categories
run_unit_tests() {
    cargo test --test 'unit/*' -- --nocapture
}

run_integration_tests() {
    cargo test --test 'integration/*' -- --nocapture
}

run_security_tests() {
    cargo test --test 'security/*' -- --nocapture
}

case "$1" in
    "unit") run_unit_tests ;;
    "integration") run_integration_tests ;;
    "security") run_security_tests ;;
    *) cargo test --all-features -- --nocapture ;;
esac
