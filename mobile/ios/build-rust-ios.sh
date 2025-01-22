#!/bin/bash
set -e

# Function to check if a command exists
command_exists () {
    type "$1" &> /dev/null ;
}

# Check required tools
if ! command_exists rustup ; then
    echo "Error: rustup is not installed"
    exit 1
fi

if ! command_exists cargo ; then
    echo "Error: cargo is not installed"
    exit 1
fi

if ! command_exists cbindgen ; then
    echo "Installing cbindgen..."
    cargo install cbindgen
fi

# Create necessary directories
mkdir -p "../rust/target/universal/include"
mkdir -p "../rust/target/universal-sim"
mkdir -p "HandReceipt/include"

# Setup rust iOS targets
echo "Adding iOS targets..."
rustup target add aarch64-apple-ios x86_64-apple-ios aarch64-apple-ios-sim

# Build for device
echo "Building for iOS devices (arm64)..."
cargo build --manifest-path ../rust/Cargo.toml --target aarch64-apple-ios --release --features ios

# Build for simulators
echo "Building for iOS simulators..."
cargo build --manifest-path ../rust/Cargo.toml --target aarch64-apple-ios-sim --release --features ios
cargo build --manifest-path ../rust/Cargo.toml --target x86_64-apple-ios --release --features ios

# Create universal binary for simulator (combining arm64 and x86_64)
echo "Creating universal binary for simulator..."
lipo -create \
    "../rust/target/aarch64-apple-ios-sim/release/libhandreceipt_mobile.a" \
    "../rust/target/x86_64-apple-ios/release/libhandreceipt_mobile.a" \
    -output "../rust/target/universal-sim/libhandreceipt_mobile.a"

# Create universal binary for device
echo "Creating universal binary for device..."
cp "../rust/target/aarch64-apple-ios/release/libhandreceipt_mobile.a" \
   "../rust/target/universal/libhandreceipt_mobile.a"

# Generate C header with cbindgen
echo "Generating C headers..."
cbindgen --config ../rust/cbindgen.toml --crate handreceipt-mobile-core --output "../rust/target/universal/include/handreceipt_mobile.h" ../rust/src/lib.rs

# Copy headers and libraries to Xcode project
echo "Copying files to Xcode project..."
cp "../rust/target/universal/include/handreceipt_mobile.h" "HandReceipt/include/"
cp "HandReceipt/handreceipt_mobile.modulemap" "HandReceipt/include/module.modulemap"

echo "Build completed successfully!" 