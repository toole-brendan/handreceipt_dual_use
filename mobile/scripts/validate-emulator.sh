#!/bin/bash
# Check Android emulator connectivity
adb shell ping -c 1 10.0.2.2

# Verify iOS simulator keychain access
xcrun simctl spawn booted security list-keychains

# Test blockchain endpoint
curl -I http://localhost:8008/blocks 