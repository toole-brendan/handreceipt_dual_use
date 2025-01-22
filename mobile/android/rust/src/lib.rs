use jni::JNIEnv;
use jni::objects::{JClass, JString};
use jni::sys::jstring;

#[no_mangle]
pub extern "system" fn Java_com_handreceipt_HandReceiptModule_nativeInit(
    _env: JNIEnv,
    _class: JClass,
) -> jstring {
    // Return a simple initialization message
    let output = "Rust library initialized";
    let output_string = _env.new_string(output)
        .expect("Couldn't create Java string!");
    output_string.into_raw()
} 