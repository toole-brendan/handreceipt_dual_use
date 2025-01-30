# Complete HandReceipt Project Structure

HandReceipt

This document provides a comprehensive view of the HandReceipt application's file structure.

```
backend
│   ├── config
│   │   └── validator.toml
│   ├── docs
│   │   └── api.md
│   ├── migrations
│   │   ├── src
│   │   │   └── main.rs
│   │   ├── 20231125_initial_schema.sql
│   │   ├── 20231126000001_fix_schema.sql
│   │   └── Cargo.toml
│   ├── scripts
│   │   ├── cleanup.sh
│   │   ├── debug-middleware.sh
│   │   ├── debug-run.sh
│   │   ├── debug-test.sh
│   │   ├── manual-test.sh
│   │   ├── run-all-tests.sh
│   │   ├── test-blockchain.sh
│   │   └── test-nft.sh
│   ├── src
│   │   ├── api
│   │   │   ├── auth
│   │   │   │   ├── audit
│   │   │   │   │   ├── chain.rs
│   │   │   │   │   ├── logger.rs
│   │   │   │   │   ├── mod.rs
│   │   │   │   │   ├── trail.rs
│   │   │   │   │   └── validator.rs
│   │   │   │   ├── encryption
│   │   │   │   │   └── mod.rs
│   │   │   │   ├── key_management
│   │   │   │   │   └── mod.rs
│   │   │   │   ├── access_control.rs
│   │   │   │   ├── merkle.rs
│   │   │   │   ├── mod.rs
│   │   │   │   └── security.rs
│   │   │   ├── handlers
│   │   │   │   ├── mobile.rs
│   │   │   │   ├── mod.rs
│   │   │   │   ├── property.rs
│   │   │   │   ├── transfer.rs
│   │   │   │   └── user.rs
│   │   │   ├── middleware
│   │   │   │   ├── auth.rs
│   │   │   │   ├── error_handler.rs
│   │   │   │   ├── mod.rs
│   │   │   │   ├── types.rs
│   │   │   │   └── validation.rs
│   │   │   ├── routes
│   │   │   │   ├── property
│   │   │   │   │   └── mod.rs
│   │   │   │   ├── user
│   │   │   │   │   └── mod.rs
│   │   │   │   ├── mobile.rs
│   │   │   │   ├── mod.rs
│   │   │   │   └── transfer.rs
│   │   │   ├── types
│   │   │   │   ├── mod.rs
│   │   │   │   └── response.rs
│   │   │   └── mod.rs
│   │   ├── application
│   │   │   ├── property
│   │   │   │   ├── commands.rs
│   │   │   │   ├── mod.rs
│   │   │   │   ├── qr.rs
│   │   │   │   ├── queries.rs
│   │   │   │   └── validation.rs
│   │   │   ├── transfer
│   │   │   │   ├── commands.rs
│   │   │   │   ├── mod.rs
│   │   │   │   └── validation.rs
│   │   │   └── mod.rs
│   │   ├── config
│   │   │   └── mod.rs
│   │   ├── domain
│   │   │   ├── models
│   │   │   │   ├── blockchain.rs
│   │   │   │   ├── history.rs
│   │   │   │   ├── location.rs
│   │   │   │   ├── mod.rs
│   │   │   │   ├── qr.rs
│   │   │   │   ├── transfer.rs
│   │   │   │   ├── types.rs
│   │   │   │   ├── user.rs
│   │   │   │   └── verification.rs
│   │   │   ├── property
│   │   │   │   ├── entity.rs
│   │   │   │   ├── mod.rs
│   │   │   │   ├── repository.rs
│   │   │   │   ├── service.rs
│   │   │   │   ├── service_impl.rs
│   │   │   │   ├── service_wrapper.rs
│   │   │   │   └── transfer.rs
│   │   │   ├── transfer
│   │   │   │   ├── repository
│   │   │   │   │   └── mock.rs
│   │   │   │   ├── entity.rs
│   │   │   │   ├── mod.rs

frontend/
│   ├── src
│   │   ├── app
│   │   ├── components
│   │   │   ├── common
│   │   │   ├── feedback
│   │   │   ├── forms
│   │   │   ├── layout
│   │   │   └── navigation
│   │   ├── features
│   │   │   ├── admin
│   │   │   ├── analytics
│   │   │   ├── audit
│   │   │   ├── auth
│   │   │   ├── blockchain
│   │   │   ├── common
│   │   │   ├── history
│   │   │   ├── mobile
│   │   │   ├── network
│   │   │   ├── notifications
│   │   │   ├── personnel
│   │   │   ├── profile
│   │   │   ├── property
│   │   │   ├── qr
│   │   │   ├── security
│   │   │   ├── settings
│   │   │   ├── system
│   │   │   └── transfer
│   │   ├── styles
│   │   │   ├── components
│   │   │   ├── layout
│   │   │   ├── theme
│   │   │   ├── themes
│   │   │   ├── tokens
│   │   │   └── utilities
│   │   └── types

mobile/
│   ├── android
│   │   ├── app
│   │   ├── gradle
│   │   └── rust
│   ├── ios
│   │   ├── HandReceipt
│   │   │   ├── Camera
│   │   │   └── Images.xcassets
│   │   ├── HandReceipt.xcodeproj
│   │   ├── HandReceipt.xcworkspace
│   │   └── HandReceiptTests
│   ├── rust
│   │   └── src
│   │       ├── offline
│   │       ├── scanner
│   │       ├── security
│   │       └── sync
│   └── src
│       ├── components
│       │   ├── common
│       │   ├── feedback
│       │   ├── forms
│       │   └── layout
│       ├── contexts
│       ├── core
│       │   ├── blockchain
│       │   ├── bridge
│       │   ├── crypto
│       │   ├── errors
│       │   ├── sync
│       │   ├── types
│       │   └── utils
│       ├── features
│       │   └── property
│       ├── hooks
│       ├── native
│       ├── navigation
│       ├── screens
│       │   ├── analytics
│       │   ├── auth
│       │   ├── command
│       │   ├── profile
│       │   ├── property
│       │   ├── reports
│       │   └── transfer
│       ├── services
│       ├── store
│       ├── types
│       └── utils

rust/
```

Total: 399 directories, 914 files

## Key Components

1. **Backend (Rust)**
   - API handlers and routes
   - Domain logic and models
   - Authentication and security
   - Database migrations
   - Testing scripts

2. **Frontend (React)**
   - Feature-based architecture
   - Comprehensive component library
   - Theme system
   - Type definitions
   - Service workers for offline support

3. **Mobile (React Native)**
   - Cross-platform (iOS/Android)
   - Native Rust modules
   - Core services (blockchain, crypto, sync)
   - Feature modules
   - Navigation and screens

4. **Shared Rust Components**
   - Core business logic
   - Cryptographic operations
   - Blockchain integration
   - Sync system
   - QR code scanning/generation

This structure represents a complex, multi-platform application with shared core functionality implemented in Rust and platform-specific UI layers in React and React Native.