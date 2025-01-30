use crate::error::Error;
use super::KeyStorageImpl;
use jni::JNIEnv;
use jni::objects::{JObject, JString};
use android_logger::Config;
use log::LevelFilter;

#[cfg(target_os = "android")]
pub struct AndroidKeyStore {
    env: JNIEnv<'static>,
    key_store: JObject<'static>,
}

impl AndroidKeyStore {
    pub fn new() -> Result<Self, Error> {
        android_logger::init_once(
            Config::default()
                .with_min_level(LevelFilter::Info)
                .with_tag("HandReceipt")
        );

        // TODO: Initialize JNI environment and KeyStore
        unimplemented!()
    }
}

impl KeyStorageImpl for AndroidKeyStore {
    fn store_key_impl(&self, key: &[u8], tag: &str) -> Result<(), Error> {
        let tag = self.env.new_string(tag)
            .map_err(|e| Error::Security(e.to_string()))?;
        
        let key = self.env.byte_array_from_slice(key)
            .map_err(|e| Error::Security(e.to_string()))?;

        self.env.call_method(
            self.key_store,
            "storeKey",
            "(Ljava/lang/String;[B)V",
            &[tag.into(), key.into()]
        ).map_err(|e| Error::Security(e.to_string()))?;

        Ok(())
    }

    fn retrieve_key_impl(&self, tag: &str) -> Result<Vec<u8>, Error> {
        let tag = self.env.new_string(tag)
            .map_err(|e| Error::Security(e.to_string()))?;

        let result = self.env.call_method(
            self.key_store,
            "retrieveKey",
            "(Ljava/lang/String;)[B",
            &[tag.into()]
        ).map_err(|e| Error::Security(e.to_string()))?;

        let array = result.l()
            .map_err(|e| Error::Security(e.to_string()))?;
        
        let bytes = self.env.convert_byte_array(array.into())
            .map_err(|e| Error::Security(e.to_string()))?;

        Ok(bytes)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_key_storage() -> Result<(), Error> {
        let keystore = AndroidKeyStore::new()?;
        let test_key = b"test_key_data";
        let alias = "test_alias";

        keystore.store_key(test_key, alias)?;
        let retrieved = keystore.retrieve_key(alias)?;
        assert_eq!(test_key.to_vec(), retrieved);
        
        Ok(())
    }
} 