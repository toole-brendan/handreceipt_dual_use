use crate::error::Error;
use super::KeyStorageImpl;
use objc::{class, msg_send, sel, sel_impl};
use objc::runtime::Object;
use core_foundation::{
    base::TCFType,
    dictionary::CFDictionary,
    string::CFString,
    data::CFData,
};
use std::ptr;

pub struct IOSKeychain;

impl IOSKeychain {
    pub fn new() -> Result<Self, Error> {
        Ok(Self)
    }

    fn create_query(&self, tag: &str, with_data: Option<&[u8]>) -> CFDictionary {
        let k_sec_class = unsafe {
            CFString::wrap_under_create_rule(
                msg_send![class!(kSecClass), UTF8String]
            )
        };
        let k_sec_class_generic_password = unsafe {
            CFString::wrap_under_create_rule(
                msg_send![class!(kSecClassGenericPassword), UTF8String]
            )
        };
        let k_sec_attr_account = unsafe {
            CFString::wrap_under_create_rule(
                msg_send![class!(kSecAttrAccount), UTF8String]
            )
        };
        let k_sec_value_data = unsafe {
            CFString::wrap_under_create_rule(
                msg_send![class!(kSecValueData), UTF8String]
            )
        };

        let mut keys = vec![
            k_sec_class.as_CFType(),
            k_sec_attr_account.as_CFType(),
        ];
        let account = CFString::new(tag);
        let mut values = vec![
            k_sec_class_generic_password.as_CFType(),
            account.as_CFType(),
        ];

        if let Some(data) = with_data {
            keys.push(k_sec_value_data.as_CFType());
            values.push(CFData::from_buffer(data).as_CFType());
        }

        CFDictionary::from_CFType_pairs(&keys, &values)
    }
}

impl KeyStorageImpl for IOSKeychain {
    fn store_key_impl(&self, key: &[u8], tag: &str) -> Result<(), Error> {
        let query = self.create_query(tag, Some(key));
        
        let status: i32 = unsafe {
            msg_send![class!(SecItemAdd),
                addItem: query.as_concrete_TypeRef(),
                error: ptr::null_mut::<Object>()]
        };

        if status == 0 {
            Ok(())
        } else {
            Err(Error::Security(format!("Failed to store key: {}", status)))
        }
    }

    fn retrieve_key_impl(&self, tag: &str) -> Result<Vec<u8>, Error> {
        let query = self.create_query(tag, None);
        let mut data_ref: *const Object = ptr::null();
        
        let status: i32 = unsafe {
            msg_send![class!(SecItemCopyMatching),
                copyMatching: query.as_concrete_TypeRef(),
                result: &mut data_ref]
        };

        if status == 0 && !data_ref.is_null() {
            let data = unsafe { CFData::wrap_under_get_rule(data_ref as *const _) };
            Ok(data.bytes().to_vec())
        } else {
            Err(Error::Security(format!("Failed to retrieve key: {}", status)))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_key_storage() -> Result<(), Error> {
        let keychain = IOSKeychain::new()?;
        let test_key = b"test_key_data";
        let tag = "test_tag";

        keychain.store_key_impl(test_key, tag)?;
        let retrieved = keychain.retrieve_key_impl(tag)?;
        assert_eq!(test_key.to_vec(), retrieved);
        
        Ok(())
    }
} 