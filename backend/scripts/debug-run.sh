#!/bin/bash

# Set environment variables for debugging
export RUST_LOG=debug
export RUST_BACKTRACE=1
export RUST_LOG_STYLE=always
export RUST_LOG_SPAN_EVENTS=full

# Additional debug flags
export RUST_DEBUG_ASSERTIONS=1
export RUST_DEBUG_PRINT_INTERNALS=1

# Run with debug features
cargo run --features "debug-logging" -- --debug

# Or alternatively, with timing information:
# RUST_LOG=debug,timing=trace cargo run 