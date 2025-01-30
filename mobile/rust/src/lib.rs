pub mod blockchain;
pub mod crypto;
pub mod error;
pub mod scanner;
pub mod security;
pub mod sync;

use crate::error::Error;
use crate::blockchain::sawtooth::processor::TransferPayload;
use crate::blockchain::sawtooth::TransactionProcessor;
use crate::sync::OfflineQueue;
use crate::blockchain::adapter::SawtoothAdapter;
use crate::blockchain::adapter::BlockchainAdapter;

use std::ffi::{CStr, CString};
use std::os::raw::c_char;
use std::panic::catch_unwind;
use std::sync::Arc;
use lazy_static::lazy_static;
use parking_lot::Mutex;
use futures;

pub type Result<T> = std::result::Result<T, Error>;

lazy_static! {
    static ref HANDRECEIPT: Arc<Mutex<HandReceiptMobile>> = Arc::new(Mutex::new(
        HandReceiptMobile::new().expect("Failed to initialize HandReceiptMobile")
    ));
}

pub struct HandReceiptMobile {
    offline_queue: OfflineQueue,
    transaction_processor: TransactionProcessor,
}

impl HandReceiptMobile {
    pub fn new() -> Result<Self> {
        Ok(Self {
            offline_queue: OfflineQueue::new(),
            transaction_processor: TransactionProcessor::new(),
        })
    }

    pub fn initialize(&mut self) -> Result<()> {
        self.offline_queue.initialize();
        Ok(())
    }

    pub fn scan_qr(&self, image_data: &[u8]) -> Result<String> {
        Ok(hex::encode(image_data))  // Placeholder implementation
    }

    pub fn verify_transfer(&self, transfer_data: &str) -> Result<bool> {
        self.transaction_processor.verify_transfer(transfer_data)
    }

    pub async fn sync_pending_transfers(&self) -> Result<()> {
        self.offline_queue.sync_pending().await
    }
}

#[no_mangle]
pub extern "C" fn handreceipt_new() -> *mut c_char {
    let result = catch_unwind_result(|| {
        HandReceiptMobile::new().map(|_| "Success".to_string())
    });

    match result {
        Ok(msg) => string_to_c_char(&msg),
        Err(e) => string_to_c_char(&format!("Error: {}", e)),
    }
}

#[no_mangle]
pub extern "C" fn handreceipt_initialize() -> *mut c_char {
    let result = catch_unwind_result(|| {
        HANDRECEIPT.lock().initialize().map(|_| "Success".to_string())
    });

    match result {
        Ok(msg) => string_to_c_char(&msg),
        Err(e) => string_to_c_char(&format!("Error: {}", e)),
    }
}

#[no_mangle]
pub extern "C" fn handreceipt_submit_transaction(action: *const c_char) -> *mut c_char {
    let result = catch_unwind_result(|| Ok(async {
        let action = unsafe { CStr::from_ptr(action) }
            .to_str()
            .map_err(|e| Error::Serialization(e.to_string()))?;
            
        let payload: TransferPayload = serde_json::from_str(action)
            .map_err(|e| Error::Serialization(e.to_string()))?;
            
        let adapter = SawtoothAdapter::new(&[])?;
        let payload_bytes = serde_json::to_vec(&payload)
            .map_err(|e| Error::Serialization(e.to_string()))?;
        let result = adapter.submit_transaction(payload_bytes).await?;
        Ok::<String, Error>(result)
    }));

    match result {
        Ok(future) => match futures::executor::block_on(future) {
            Ok(tx_id) => string_to_c_char(&tx_id),
            Err(e) => string_to_c_char(&format!("Error: {}", e)),
        },
        Err(e) => string_to_c_char(&format!("Error: {}", e)),
    }
}

#[no_mangle]
pub extern "C" fn handreceipt_get_pending_transactions() -> *mut c_char {
    let result = catch_unwind_result(|| {
        let transactions = HANDRECEIPT.lock().offline_queue.get_pending()?;
        serde_json::to_string(&transactions).map_err(|e| Error::Serialization(e.to_string()))
    });

    match result {
        Ok(json) => string_to_c_char(&json),
        Err(e) => string_to_c_char(&format!("Error: {}", e)),
    }
}

#[no_mangle]
pub extern "C" fn handreceipt_free_string(s: *mut c_char) {
    unsafe {
        if !s.is_null() {
            let _ = CString::from_raw(s);
        }
    }
}

fn string_to_c_char(s: &str) -> *mut c_char {
    CString::new(s)
        .expect("CString conversion failed")
        .into_raw()
}

fn catch_unwind_result<F, T>(f: F) -> Result<T>
where
    F: FnOnce() -> Result<T> + std::panic::UnwindSafe,
{
    match catch_unwind(f) {
        Ok(result) => result,
        Err(_) => Err(Error::System("Panic occurred".into())),
    }
} 