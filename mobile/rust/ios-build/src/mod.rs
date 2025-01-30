use std::os::raw::{c_char, c_void};
use std::ffi::{CStr, CString};
use std::sync::Arc;
use parking_lot::Mutex;
use lazy_static::lazy_static;
use crate::blockchain::sawtooth::{TransactionProcessor, TransferPayload};
use crate::sync::queue::offline_buffer::{OfflineQueue, NetworkStatus};
use crate::crypto::CryptoManager;

lazy_static! {
    static ref TRANSACTION_PROCESSOR: Arc<TransactionProcessor> = Arc::new(TransactionProcessor::new());
    static ref OFFLINE_QUEUE: Arc<Mutex<OfflineQueue>> = Arc::new(Mutex::new(OfflineQueue::new(
        Arc::new(Default::default()),
        1000
    )));
    static ref CRYPTO_MANAGER: Arc<Mutex<CryptoManager>> = Arc::new(Mutex::new(CryptoManager::new().unwrap()));
}

#[no_mangle]
pub extern "C" fn submit_transaction(payload: *const c_char) -> *mut c_char {
    let payload_str = unsafe {
        CStr::from_ptr(payload)
            .to_str()
            .expect("Invalid payload string")
    };

    let transfer_payload: TransferPayload = serde_json::from_str(payload_str)
        .expect("Failed to parse payload");

    let tx_id = OFFLINE_QUEUE.lock()
        .add_transaction(
            serde_json::to_vec(&transfer_payload).unwrap(),
            None
        )
        .expect("Failed to queue transaction");

    CString::new(tx_id)
        .expect("Failed to create response string")
        .into_raw()
}

#[no_mangle]
pub extern "C" fn get_pending_transactions() -> *mut c_char {
    let pending = OFFLINE_QUEUE.lock()
        .get_pending_transactions();

    let json = serde_json::to_string(&pending)
        .expect("Failed to serialize transactions");

    CString::new(json)
        .expect("Failed to create response string")
        .into_raw()
}

#[no_mangle]
pub extern "C" fn set_network_status(status: *const c_char) {
    let status_str = unsafe {
        CStr::from_ptr(status)
            .to_str()
            .expect("Invalid status string")
    };

    let network_status = match status_str {
        "HIGH_THROUGHPUT" => NetworkStatus::HighThroughput,
        "METERED" => NetworkStatus::Metered,
        _ => NetworkStatus::Offline,
    };

    OFFLINE_QUEUE.lock()
        .sync_flush(&network_status)
        .expect("Failed to sync transactions");
}

#[no_mangle]
pub extern "C" fn generate_key() -> *mut c_void {
    let key_pair = CRYPTO_MANAGER.lock()
        .generate_key()
        .expect("Failed to generate key");

    Box::into_raw(Box::new(key_pair)) as *mut c_void
}

#[no_mangle]
pub extern "C" fn free_string(ptr: *mut c_char) {
    unsafe {
        if !ptr.is_null() {
            let _ = CString::from_raw(ptr);
        }
    }
}

#[no_mangle]
pub extern "C" fn free_bytes(ptr: *mut c_void) {
    unsafe {
        if !ptr.is_null() {
            let _ = Box::from_raw(ptr as *mut Vec<u8>);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::ffi::CString;

    #[test]
    fn test_submit_transaction() {
        let payload = r#"{"action":"transfer","property_id":"123","from":"A","to":"B","timestamp":1234}"#;
        let c_payload = CString::new(payload).unwrap();
        
        let result = submit_transaction(c_payload.as_ptr());
        assert!(!result.is_null());
        
        unsafe {
            let _ = CString::from_raw(result);
        }
    }

    #[test]
    fn test_get_pending_transactions() {
        let result = get_pending_transactions();
        assert!(!result.is_null());
        
        unsafe {
            let transactions = CStr::from_ptr(result).to_str().unwrap();
            assert!(transactions.starts_with('['));
            let _ = CString::from_raw(result);
        }
    }
} 