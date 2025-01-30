#!/bin/bash
set -e

# Configuration
FRAMEWORK_NAME="HandReceiptMobile"
FRAMEWORK_VERSION="A"
FRAMEWORK_PATH="./build/${FRAMEWORK_NAME}.framework"

# Build for all required architectures
echo "Building for iOS architectures..."
cargo lipo --release --targets \
    aarch64-apple-ios \
    x86_64-apple-ios-simulator

# Create framework structure
mkdir -p "${FRAMEWORK_PATH}/Headers"
mkdir -p "${FRAMEWORK_PATH}/Modules"

# Copy module map
cp module.modulemap "${FRAMEWORK_PATH}/Modules/"

# Copy headers
cp ../include/*.h "${FRAMEWORK_PATH}/Headers/"

# Copy binary
cp "../target/universal/release/libhandreceipt_mobile.a" "${FRAMEWORK_PATH}/${FRAMEWORK_NAME}"

# Create Info.plist
cat > "${FRAMEWORK_PATH}/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleExecutable</key>
    <string>${FRAMEWORK_NAME}</string>
    <key>CFBundleIdentifier</key>
    <string>com.handreceipt.mobile</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>${FRAMEWORK_NAME}</string>
    <key>CFBundlePackageType</key>
    <string>FMWK</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>MinimumOSVersion</key>
    <string>13.0</string>
</dict>
</plist>
EOF

echo "Framework created at: ${FRAMEWORK_PATH}" 