use crate::error::Error;
use crate::crypto::platform::PlatformKeyStore;

#[cfg(target_os = "android")]
pub mod platform;
#[cfg(target_os = "ios")] 
pub mod platform;
#[cfg(not(any(target_os = "android", target_os = "ios")))]
pub mod platform {
    use crate::error::Error;
    
    pub struct PlatformKeyStore;
    
    impl PlatformKeyStore {
        pub fn new() -> Result<Self, Error> {
            Ok(Self)
        }
        
        pub fn store_key_impl(&self, _key: &[u8], _tag: &str) -> Result<(), Error> {
            Ok(())
        }
        
        pub fn retrieve_key_impl(&self, _tag: &str) -> Result<Vec<u8>, Error> {
            Ok(vec![])
        }
    }
}

pub trait KeyStorage {
    fn store_key(&self, key: &[u8], tag: &str) -> Result<(), Error>;
    fn retrieve_key(&self, tag: &str) -> Result<Vec<u8>, Error>;
}

impl KeyStorage for PlatformKeyStore {
    fn store_key(&self, key: &[u8], tag: &str) -> Result<(), Error> {
        self.store_key_impl(key, tag)
    }

    fn retrieve_key(&self, tag: &str) -> Result<Vec<u8>, Error> {
        self.retrieve_key_impl(tag)
    }
}

pub struct CryptoManager {
    key_storage: PlatformKeyStore,
}

impl CryptoManager {
    pub fn new() -> Result<Self, Error> {
        Ok(Self {
            key_storage: PlatformKeyStore::new()?,
        })
    }

    pub fn store_key(&self, key: &[u8], tag: &str) -> Result<(), Error> {
        self.key_storage.store_key(key, tag)
    }

    pub fn retrieve_key(&self, tag: &str) -> Result<Vec<u8>, Error> {
        self.key_storage.retrieve_key(tag)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_crypto_manager() -> Result<(), Error> {
        let manager = CryptoManager::new()?;
        let test_key = b"test_sawtooth_key";

        manager.store_key(test_key, "sawtooth_private_key")?;
        let retrieved = manager.retrieve_key("sawtooth_private_key")?;
        assert_eq!(test_key.to_vec(), retrieved);

        Ok(())
    }
} 