HANDRECEIPT (TOTAL TREE STRUCTURE)

[ 704] .
├── [ 480] backend
│ ├── [ 96] config
│ ├── [ 96] docs
│ ├── [ 192] migrations
│ │ └── [ 96] src
│ │ └── [2.8K] main.rs
│ ├── [ 320] scripts
│ ├── [ 512] src
│ │ ├── [ 256] api
│ │ │ ├── [ 288] auth
│ │ │ ├── [ 224] handlers
│ │ │ ├── [ 224] middleware
│ │ │ ├── [1.2K] mod.rs
│ │ │ ├── [ 224] routes
│ │ │ └── [ 128] types
│ │ ├── [3.0K] app_builder.rs
│ │ ├── [ 160] application
│ │ │ ├── [ 149] mod.rs
│ │ │ ├── [ 224] property
│ │ │ └── [ 160] transfer
│ │ ├── [ 96] config
│ │ │ └── [ 644] mod.rs
│ │ ├── [ 769] core.rs
│ │ ├── [ 224] domain
│ │ │ ├── [ 361] error.rs
│ │ │ ├── [ 143] mod.rs
│ │ │ ├── [ 352] models
│ │ │ ├── [ 288] property
│ │ │ └── [ 288] transfer
│ │ ├── [ 352] error
│ │ │ ├── [1.7K] api.rs
│ │ │ ├── [ 331] audit.rs
│ │ │ ├── [1.3K] blockchain.rs
│ │ │ ├── [2.3K] core.rs
│ │ │ ├── [ 366] database.rs
│ │ │ ├── [ 331] mod.rs
│ │ │ ├── [ 856] repository.rs
│ │ │ ├── [ 535] security.rs
│ │ │ └── [ 456] validation.rs
│ │ ├── [ 160] infrastructure
│ │ │ ├── [ 352] blockchain
│ │ │ ├── [ 444] mod.rs
│ │ │ └── [ 192] persistence
│ │ ├── [ 230] lib.rs
│ │ ├── [2.4K] main.rs
│ │ ├── [ 96] migrations
│ │ │ └── [1.1K] mod.rs
│ │ ├── [ 192] security
│ │ │ ├── [2.1K] access_control.rs
│ │ │ ├── [1.5K] auth.rs
│ │ │ ├── [1.7K] context.rs
│ │ │ └── [ 171] mod.rs
│ │ ├── [ 480] types
│ │ │ ├── [4.2K] app.rs
│ │ │ ├── [ 968] asset.rs
│ │ │ ├── [1.9K] audit.rs
│ │ │ ├── [4.4K] blockchain.rs
│ │ │ ├── [ 753] mod.rs
│ │ │ ├── [ 901] permissions.rs
│ │ │ ├── [ 983] property.rs
│ │ │ ├── [4.4K] scanning.rs
│ │ │ ├── [ 128] security
│ │ │ ├── [3.2K] signature.rs
│ │ │ ├── [ 464] user.rs
│ │ │ ├── [3.0K] validation.rs
│ │ │ └── [3.6K] verification.rs
│ │ └── [ 96] utils
│ │ └── [ 790] mod.rs
│ ├── [ 256] tests
│ │ ├── [ 128] common
│ │ │ ├── [8.2K] mocks.rs
│ │ │ └── [5.4K] mod.rs
│ │ ├── [ 288] integration
│ │ │ ├── [3.8K] blockchain_verification_test.rs
│ │ │ ├── [2.1K] mobile_workflow_test.rs
│ │ │ ├── [1.4K] mod.rs
│ │ │ ├── [5.8K] sawtooth_integration_test.rs
│ │ │ ├── [3.2K] security_test.rs
│ │ │ ├── [2.5K] transfer_edge_test.rs
│ │ │ └── [1.7K] transfer_workflow_test.rs
│ │ ├── [ 286] mod.rs
│ │ └── [ 256] unit
│ │ ├── [2.4K] access_control_test.rs
│ │ ├── [3.2K] core_test.rs
│ │ ├── [2.7K] error_test.rs
│ │ ├── [ 163] mod.rs
│ │ ├── [ 128] scanning
│ │ └── [ 160] signature
│ └── [ 96] tools
│ └── [ 128] diagnostics
│ └── [ 96] src
├── [ 256] docs
├── [ 672] frontend
│ ├── [ 160] public
│ ├── [ 864] src
│ │ ├── [ 192] app
│ │ │ ├── [1.2K] App.tsx
│ │ │ ├── [ 40] index.ts
│ │ │ ├── [1.2K] main.tsx
│ │ │ └── [6.9K] routes.tsx
│ │ ├── [ 288] components
│ │ │ ├── [1.6K] CommandPaletteProvider.tsx
│ │ │ ├── [1.4K] ToastProvider.tsx
│ │ │ ├── [ 448] common
│ │ │ ├── [ 128] feedback
│ │ │ ├── [ 352] forms
│ │ │ ├── [ 320] layout
│ │ │ └── [ 160] navigation
│ │ ├── [ 96] config
│ │ │ └── [ 296] serviceWorkerConfig.ts
│ │ ├── [ 384] constants
│ │ │ ├── [ 344] api.ts
│ │ │ ├── [ 142] date.ts
│ │ │ ├── [ 396] errors.ts
│ │ │ ├── [ 263] index.ts
│ │ │ ├── [ 392] permissions.ts
│ │ │ ├── [ 309] property.ts
│ │ │ ├── [ 323] routes.ts
│ │ │ ├── [ 345] status.ts
│ │ │ ├── [ 234] ui.ts
│ │ │ └── [ 270] validation.ts
│ │ ├── [ 160] contexts
│ │ │ ├── [ 864] AssetContext.tsx
│ │ │ ├── [4.7K] SettingsContext.tsx
│ │ │ └── [1.9K] ThemeContext.tsx
│ │ ├── [ 96] docs
│ │ ├── [ 218] env.d.ts
│ │ ├── [ 736] features
│ │ │ ├── [ 96] admin
│ │ │ ├── [ 128] analytics
│ │ │ ├── [ 96] audit
│ │ │ ├── [ 192] auth
│ │ │ ├── [ 160] blockchain
│ │ │ ├── [ 128] common
│ │ │ ├── [ 224] history
│ │ │ ├── [ 96] mobile
│ │ │ ├── [ 96] network
│ │ │ ├── [ 96] officer
│ │ │ ├── [ 224] personnel
│ │ │ ├── [ 192] profile
│ │ │ ├── [ 160] property
│ │ │ ├── [ 224] qr-generator
│ │ │ ├── [ 128] security
│ │ │ ├── [ 256] sensitive-items
│ │ │ ├── [ 160] settings
│ │ │ ├── [ 96] soldier
│ │ │ ├── [ 128] system
│ │ │ ├── [ 160] transfers
│ │ │ └── [ 128] verification
│ │ ├── [ 160] hooks
│ │ │ ├── [ 55] index.ts
│ │ │ ├── [ 493] useAuth.ts
│ │ │ └── [ 893] useTheme.ts
│ │ ├── [ 278] index.tsx
│ │ ├── [ 96] lib
│ │ │ └── [2.2K] utils.ts
│ │ ├── [1.9K] main.tsx
│ │ ├── [ 96] middleware
│ │ │ └── [ 497] errorHandler.ts
│ │ ├── [ 224] mocks
│ │ │ ├── [ 131] browser.ts
│ │ │ ├── [ 384] handlers.ts
│ │ │ ├── [3.1K] mockData.ts
│ │ │ ├── [5.5K] mockPersonnelData.ts
│ │ │ └── [ 320] setup.ts
│ │ ├── [ 416] pages
│ │ │ ├── [ 128] admin
│ │ │ ├── [ 192] auth
│ │ │ ├── [ 96] history
│ │ │ ├── [ 375] layout.tsx
│ │ │ ├── [ 128] personnel
│ │ │ ├── [ 128] property
│ │ │ ├── [ 128] qr
│ │ │ ├── [ 96] sensitive-items
│ │ │ ├── [ 96] settings
│ │ │ ├── [ 128] transfers
│ │ │ └── [ 256] utility
│ │ ├── [1.7K] serviceWorker.ts
│ │ ├── [ 320] services
│ │ │ ├── [ 238] analytics.ts
│ │ │ ├── [ 192] api
│ │ │ ├── [3.4K] api.ts
│ │ │ ├── [ 789] auth.ts
│ │ │ ├── [ 273] errorTracking.ts
│ │ │ ├── [ 71] index.ts
│ │ │ └── [3.8K] websocket.ts
│ │ ├── [ 224] shared
│ │ │ ├── [ 320] components
│ │ │ ├── [ 256] hooks
│ │ │ ├── [ 96] styles
│ │ │ ├── [ 160] types
│ │ │ └── [ 192] utils
│ │ ├── [ 224] store
│ │ │ ├── [ 56] index.ts
│ │ │ ├── [ 192] middleware
│ │ │ ├── [ 160] selectors
│ │ │ ├── [ 256] slices
│ │ │ └── [1.7K] store.ts
│ │ ├── [ 480] stories
│ │ │ ├── [1.4K] Button.stories.ts
│ │ │ ├── [ 888] Button.tsx
│ │ │ ├── [ 788] Header.stories.ts
│ │ │ ├── [1.5K] Header.tsx
│ │ │ ├── [1.0K] Page.stories.ts
│ │ │ ├── [2.5K] Page.tsx
│ │ │ ├── [ 576] assets
│ │ │ ├── [ 96] inputs
│ │ │ └── [ 96] layout
│ │ ├── [ 384] styles
│ │ │ ├── [ 480] base
│ │ │ ├── [ 608] components
│ │ │ ├── [ 608] features
│ │ │ ├── [ 224] layout
│ │ │ ├── [ 224] theme
│ │ │ ├── [ 192] themes
│ │ │ ├── [ 224] tokens
│ │ │ └── [ 256] utilities
│ │ ├── [ 288] types
│ │ │ ├── [ 934] auth.ts
│ │ │ ├── [ 434] index.ts
│ │ │ ├── [1.5K] personnel.ts
│ │ │ ├── [1.8K] property.ts
│ │ │ ├── [ 630] shared.ts
│ │ │ ├── [ 676] theme.ts
│ │ │ └── [ 285] websocket.ts
│ │ └── [ 160] utils
│ │ ├── [ 96] core
│ │ ├── [ 24] index.ts
│ │ └── [ 128] types
│ └── [1.1K] vite.config.ts
├── [ 576] mobile
│ ├── [ 384] android
│ │ ├── [ 192] app
│ │ │ ├── [6.7K] build.gradle
│ │ │ └── [ 128] src
│ │ ├── [3.0K] build.gradle
│ │ ├── [ 96] gradle
│ │ │ └── [ 128] wrapper
│ │ ├── [2.2K] gradle.properties
│ │ ├── [ 96] rust
│ │ │ └── [ 96] src
│ │ └── [ 512] settings.gradle
│ ├── [ 320] ios
│ │ ├── [ 544] HandReceipt
│ │ │ ├── [ 96] Camera
│ │ │ ├── [ 96] Extensions
│ │ │ ├── [ 11K] HandReceiptModule.swift
│ │ │ ├── [ 128] Images.xcassets
│ │ │ └── [ 317] QRCameraManager.swift
│ │ ├── [ 128] HandReceipt.xcodeproj
│ │ │ └── [ 96] xcshareddata
│ │ ├── [ 96] HandReceipt.xcworkspace
│ │ └── [ 128] HandReceiptTests
│ ├── [ 256] rust
│ │ ├── [ 160] android-build
│ │ │ ├── [ 909] build.rs
│ │ │ └── [ 96] src
│ │ ├── [ 160] ios-build
│ │ │ └── [ 96] src
│ │ └── [ 352] src
│ │ ├── [ 160] blockchain
│ │ ├── [ 160] crypto
│ │ ├── [3.6K] error.rs
│ │ ├── [4.0K] ffi.rs
│ │ ├── [4.2K] lib.rs
│ │ ├── [ 96] offline
│ │ ├── [ 128] scanner
│ │ ├── [ 96] security
│ │ └── [ 128] sync
│ ├── [ 96] scripts
│ └── [ 544] src
│ ├── [2.3K] App.tsx
│ ├── [ 96] android
│ │ └── [ 96] NativeModules
│ ├── [ 192] components
│ │ ├── [ 224] common
│ │ ├── [ 128] feedback
│ │ ├── [ 128] forms
│ │ └── [ 96] layout
│ ├── [ 96] contexts
│ │ └── [ 866] AuthContext.tsx
│ ├── [ 288] core
│ │ ├── [ 96] blockchain
│ │ ├── [ 96] bridge
│ │ ├── [ 192] crypto
│ │ ├── [ 96] errors
│ │ ├── [ 160] sync
│ │ ├── [ 160] types
│ │ └── [ 96] utils
│ ├── [ 128] features
│ │ ├── [ 193] index.ts
│ │ └── [ 96] property
│ ├── [ 160] hooks
│ │ ├── [1.9K] useAuth.ts
│ │ ├── [1.5K] useNetworkStatus.ts
│ │ └── [6.2K] useTransferQueue.ts
│ ├── [ 96] ios
│ │ └── [ 96] NativeModules
│ ├── [ 96] native
│ │ └── [5.7K] HandReceiptMobile.ts
│ ├── [ 96] navigation
│ │ └── [7.0K] index.tsx
│ ├── [ 288] screens
│ │ ├── [ 96] analytics
│ │ ├── [ 160] auth
│ │ ├── [ 128] command
│ │ ├── [ 96] profile
│ │ ├── [ 160] property
│ │ ├── [ 128] reports
│ │ └── [ 192] transfer
│ ├── [ 96] services
│ │ └── [7.3K] api.ts
│ ├── [ 96] store
│ │ └── [1.1K] index.ts
│ ├── [ 256] types
│ │ ├── [ 628] auth.ts
│ │ ├── [ 169] env.d.ts
│ │ ├── [3.0K] navigation.ts
│ │ ├── [ 656] qrcode.d.ts
│ │ ├── [1.2K] scanner.ts
│ │ └── [ 923] sync.ts
│ └── [ 160] utils
│ ├── [ 210] date.ts
│ ├── [1.5K] diagnostics.ts
│ └── [1.3K] error-handler.ts
└── [ 96] rust
188 directories, 139 files






This is a description of my app — HandReceipt

Goal: Develop a secure, blockchain-based system for tracking property, ensuring high availability, enabling offline operation, and providing robust auditability.

Meant to be a secure military property management system using QR codes and blockchain verification. (mobile-first with offline support).  Where QR codes or barcodes are affixed to property which, when scanned, prompt a transfer request to be sent to the current person assigned that property.     (And Transfer Workflow = 
  - QR code scanning for transfers with mobile, transfer approved or denied
* transfer “sent” to the backend where sawtooth blockchain uses PoET to verify and record the transfer.)


QR codes or barcodes are generated only by “officer” users (RBAC) and are linked to a digital twin of a piece of property