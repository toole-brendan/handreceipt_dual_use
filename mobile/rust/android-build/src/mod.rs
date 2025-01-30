use jni::JNIEnv;
use jni::objects::{JClass, JString, JObject, JValue};
use jni::sys::{jstring, jobject, jbyteArray};
use crate::blockchain::sawtooth::{TransactionProcessor, TransferPayload};
use crate::sync::queue::offline_buffer::{OfflineQueue, NetworkStatus};
use crate::crypto::CryptoManager;
use std::sync::Arc;
use parking_lot::Mutex;
use lazy_static::lazy_static;

lazy_static! {
    static ref TRANSACTION_PROCESSOR: Arc<TransactionProcessor> = Arc::new(TransactionProcessor::new());
    static ref OFFLINE_QUEUE: Arc<Mutex<OfflineQueue>> = Arc::new(Mutex::new(OfflineQueue::new(
        Arc::new(Default::default()),
        1000
    )));
    static ref CRYPTO_MANAGER: Arc<Mutex<CryptoManager>> = Arc::new(Mutex::new(CryptoManager::new().unwrap()));
}

#[no_mangle]
pub extern "system" fn Java_com_handreceipt_SawtoothModule_submitTransaction(
    env: JNIEnv,
    _class: JClass,
    payload: JString,
) -> jstring {
    let payload_str: String = env.get_string(payload)
        .expect("Failed to get payload string")
        .into();

    let transfer_payload: TransferPayload = serde_json::from_str(&payload_str)
        .expect("Failed to parse payload");

    // Queue transaction
    let tx_id = OFFLINE_QUEUE.lock()
        .add_transaction(
            serde_json::to_vec(&transfer_payload).unwrap(),
            None
        )
        .expect("Failed to queue transaction");

    let output = env.new_string(tx_id)
        .expect("Failed to create response string");
    output.into_inner()
}

#[no_mangle]
pub extern "system" fn Java_com_handreceipt_SawtoothModule_getPendingTransactions(
    env: JNIEnv,
    _class: JClass,
) -> jobject {
    let pending = OFFLINE_QUEUE.lock()
        .get_pending_transactions();

    // Convert to Java ArrayList
    let array_list_class = env.find_class("java/util/ArrayList")
        .expect("Failed to find ArrayList class");
    let array_list = env.new_object(array_list_class, "()V", &[])
        .expect("Failed to create ArrayList");

    for tx in pending {
        let tx_json = serde_json::to_string(&tx)
            .expect("Failed to serialize transaction");
        let tx_string = env.new_string(tx_json)
            .expect("Failed to create string");
        env.call_method(
            array_list,
            "add",
            "(Ljava/lang/Object;)Z",
            &[JValue::Object(tx_string.into())]
        ).expect("Failed to add to ArrayList");
    }

    array_list.into_inner()
}

#[no_mangle]
pub extern "system" fn Java_com_handreceipt_SawtoothModule_setNetworkStatus(
    env: JNIEnv,
    _class: JClass,
    status: JString,
) {
    let status_str: String = env.get_string(status)
        .expect("Failed to get status string")
        .into();

    let network_status = match status_str.as_str() {
        "HIGH_THROUGHPUT" => NetworkStatus::HighThroughput,
        "METERED" => NetworkStatus::Metered,
        _ => NetworkStatus::Offline,
    };

    OFFLINE_QUEUE.lock()
        .sync_flush(&network_status)
        .expect("Failed to sync transactions");
}

#[no_mangle]
pub extern "system" fn Java_com_handreceipt_SawtoothModule_generateKey(
    env: JNIEnv,
    _class: JClass,
) -> jbyteArray {
    let key_pair = CRYPTO_MANAGER.lock()
        .generate_key()
        .expect("Failed to generate key");

    let byte_array = env.new_byte_array(key_pair.len() as i32)
        .expect("Failed to create byte array");
    env.set_byte_array_region(byte_array, 0, &key_pair)
        .expect("Failed to set byte array");
    byte_array
}

#[cfg(test)]
mod tests {
    use super::*;
    use jni::JavaVM;
    use std::ptr;

    #[test]
    fn test_jni_submit_transaction() {
        let jvm_args = jni::InitArgsBuilder::new()
            .version(jni::JNIVersion::V8)
            .build()
            .unwrap();
        let jvm = JavaVM::new(jvm_args).unwrap();
        let env = jvm.attach_current_thread().unwrap();

        let payload = r#"{"action":"transfer","property_id":"123","from":"A","to":"B","timestamp":1234}"#;
        let j_payload = env.new_string(payload).unwrap();

        let result = Java_com_handreceipt_SawtoothModule_submitTransaction(
            env,
            JClass::from(ptr::null_mut()),
            j_payload
        );

        assert!(!result.is_null());
    }
} 