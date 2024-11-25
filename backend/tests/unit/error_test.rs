use handreceipt::error::CoreError;
use serde::ser::Error as SerdeError;
use std::error::Error;

#[test]
fn test_core_error_creation_and_display() {
    // Test System error
    let system_err = CoreError::System("System failure".to_string());
    assert_eq!(system_err.to_string(), "System error: System failure");

    // Test Database error
    let db_err = CoreError::Database("Connection failed".to_string());
    assert_eq!(db_err.to_string(), "Database error: Connection failed");

    // Test Repository error
    let repo_err = CoreError::Repository("Data retrieval error".to_string());
    assert_eq!(repo_err.to_string(), "Repository error: Data retrieval error");

    // Test Validation error
    let validation_err = CoreError::Validation("Invalid input".to_string());
    assert_eq!(validation_err.to_string(), "Validation error: Invalid input");

    // Test Security error
    let security_err = CoreError::SecurityError("Access denied".to_string());
    assert_eq!(security_err.to_string(), "Security error: Access denied");
}

#[test]
fn test_error_trait_implementation() {
    let err = CoreError::Database("Connection failed".to_string());
    
    // Test that our error implements std::error::Error
    let _err_ref: &dyn Error = &err;
    
    // Test error source (should be None in this case)
    assert!(err.source().is_none());
}

#[test]
fn test_error_conversion() {
    // Test converting from serde_json::Error
    let json_error = serde_json::Error::custom("JSON parsing failed");
    let core_error: CoreError = json_error.into();
    assert!(matches!(core_error, CoreError::System(_)));
    assert_eq!(core_error.to_string(), "System error: JSON parsing failed");
}

#[test]
fn test_specific_error_variants() {
    // Test Authentication error
    let auth_err = CoreError::Authentication("Invalid credentials".to_string());
    assert_eq!(auth_err.to_string(), "Authentication error: Invalid credentials");

    // Test Authorization error
    let authz_err = CoreError::Authorization("Insufficient permissions".to_string());
    assert_eq!(authz_err.to_string(), "Authorization error: Insufficient permissions");

    // Test Not Found error
    let not_found_err = CoreError::NotFound("Resource not found".to_string());
    assert_eq!(not_found_err.to_string(), "Not found: Resource not found");
}

#[test]
fn test_specialized_errors() {
    // Test QR Code error
    let qr_err = CoreError::QRCode("Invalid QR format".to_string());
    assert_eq!(qr_err.to_string(), "QR code error: Invalid QR format");

    // Test Image processing error
    let image_err = CoreError::Image("Image processing failed".to_string());
    assert_eq!(image_err.to_string(), "Image processing error: Image processing failed");
}
