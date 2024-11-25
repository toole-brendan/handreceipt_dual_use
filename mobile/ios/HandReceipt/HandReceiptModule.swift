import Foundation
import React

@objc(HandReceiptModule)
class HandReceiptModule: NSObject {
    private var corePtr: UnsafeMutableRawPointer?
    private let queue = DispatchQueue(label: "com.handreceipt.core", qos: .userInitiated)
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    private func withErrorHandling(_ promise: RCTPromiseResolveBlock,
                                 _ reject: RCTPromiseRejectBlock,
                                 operation: () throws -> Any?) {
        do {
            let result = try operation()
            promise(result)
        } catch let error {
            reject("ERROR", error.localizedDescription, error)
        }
    }
    
    @objc(initialize:withRejecter:)
    func initialize(_ resolve: @escaping RCTPromiseResolveBlock,
                   withRejecter reject: @escaping RCTPromiseRejectBlock) {
        queue.async {
            self.withErrorHandling(resolve, reject) {
                self.corePtr = mobile_core_new()
                return nil
            }
        }
    }
    
    @objc(scanQRCode:withResolver:withRejecter:)
    func scanQRCode(_ data: String,
                   withResolver resolve: @escaping RCTPromiseResolveBlock,
                   withRejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let ptr = corePtr else {
            reject("NOT_INITIALIZED", "Core not initialized", nil)
            return
        }
        
        queue.async {
            self.withErrorHandling(resolve, reject) {
                let result = scan_qr(ptr, data)
                return String(cString: result!)
            }
        }
    }
    
    @objc(verifyTransferData:withResolver:withRejecter:)
    func verifyTransferData(_ scanData: String,
                          withResolver resolve: @escaping RCTPromiseResolveBlock,
                          withRejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let ptr = corePtr else {
            reject("NOT_INITIALIZED", "Core not initialized", nil)
            return
        }
        
        queue.async {
            self.withErrorHandling(resolve, reject) {
                return verify_transfer(ptr, scanData)
            }
        }
    }
    
    @objc(syncTransfers:withRejecter:)
    func syncTransfers(_ resolve: @escaping RCTPromiseResolveBlock,
                      withRejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let ptr = corePtr else {
            reject("NOT_INITIALIZED", "Core not initialized", nil)
            return
        }
        
        queue.async {
            self.withErrorHandling(resolve, reject) {
                sync_pending_transfers(ptr)
                return nil
            }
        }
    }
    
    deinit {
        if let ptr = corePtr {
            mobile_core_free(ptr)
        }
    }
}

// FFI declarations
private func mobile_core_new() -> UnsafeMutableRawPointer? {
    return nil // Implemented in Rust
}

private func mobile_core_free(_ ptr: UnsafeMutableRawPointer) {
    // Implemented in Rust
}

private func scan_qr(_ ptr: UnsafeMutableRawPointer, _ data: String) -> UnsafePointer<CChar>? {
    return nil // Implemented in Rust
}

private func verify_transfer(_ ptr: UnsafeMutableRawPointer, _ data: String) -> Bool {
    return false // Implemented in Rust
}

private func sync_pending_transfers(_ ptr: UnsafeMutableRawPointer) {
    // Implemented in Rust
} 