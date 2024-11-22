use backend::error::CoreError;
use std::error::Error;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_creation_and_display() {
        // Test ValidationError
        let validation_err = CoreError::ValidationError("Invalid input".to_string());
        assert_eq!(
            validation_err.to_string(),
            "Validation error: Invalid input"
        );

        // Test AuthenticationError
        let auth_err = CoreError::AuthenticationError("Invalid credentials".to_string());
        assert_eq!(
            auth_err.to_string(),
            "Authentication error: Invalid credentials"
        );

        // Test AuthorizationError
        let authz_err = CoreError::AuthorizationError("Insufficient permissions".to_string());
        assert_eq!(
            authz_err.to_string(),
            "Authorization error: Insufficient permissions"
        );
    }

    #[test]
    fn test_error_trait_implementation() {
        let err = CoreError::DatabaseError("Connection failed".to_string());
        
        // Test that our error implements std::error::Error
        let _err_ref: &dyn Error = &err;
        
        // Test error source (should be None in this case)
        assert!(err.source().is_none());
    }

    #[test]
    fn test_specific_error_variants() {
        // Test NetworkError
        let network_err = CoreError::NetworkError("Connection timeout".to_string());
        assert_eq!(
            network_err.to_string(),
            "Network error: Connection timeout"
        );

        // Test BlockchainError
        let blockchain_err = CoreError::BlockchainError("Invalid block".to_string());
        assert_eq!(
            blockchain_err.to_string(),
            "Blockchain error: Invalid block"
        );

        // Test SyncError
        let sync_err = CoreError::SyncError("Sync failed".to_string());
        assert_eq!(
            sync_err.to_string(),
            "Sync error: Sync failed"
        );
    }

    #[test]
    fn test_security_related_errors() {
        // Test EncryptionError
        let encryption_err = CoreError::EncryptionError("Key generation failed".to_string());
        assert_eq!(
            encryption_err.to_string(),
            "Encryption error: Key generation failed"
        );

        // Test SignatureError
        let signature_err = CoreError::SignatureError("Invalid signature".to_string());
        assert_eq!(
            signature_err.to_string(),
            "Signature error: Invalid signature"
        );
    }

    #[test]
    fn test_device_related_errors() {
        // Test QRCodeError
        let qr_err = CoreError::QRCodeError("Invalid QR format".to_string());
        assert_eq!(
            qr_err.to_string(),
            "QR code error: Invalid QR format"
        );

        // Test RFIDError
        let rfid_err = CoreError::RFIDError("Tag read failed".to_string());
        assert_eq!(
            rfid_err.to_string(),
            "RFID error: Tag read failed"
        );
    }

    #[test]
    fn test_error_conversion() {
        // Test converting from std::io::Error
        let io_error = std::io::Error::new(std::io::ErrorKind::NotFound, "file not found");
        let core_error = CoreError::SystemError(io_error.to_string());
        assert_eq!(core_error.to_string(), "System error: file not found");
    }
} 