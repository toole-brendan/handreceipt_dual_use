use uuid::Uuid;
use crate::{
    services::asset::scanning::rfid::RFIDWriter,
    types::{
        scanning::{Scanner, ScanError, ScanType},
        security::{SecurityContext, SecurityClassification},
    },
};

#[tokio::test]
async fn test_rfid_scanning() {
    let writer = RFIDWriter::new("TEST-RFID-001".to_string());
    
    // Test scanning
    let data = b"test rfid data";
    let scan_result = writer.scan(data).await.unwrap();
    
    // Verify scan result
    assert_eq!(scan_result.scan_type, ScanType::RFID);
    assert!(scan_result.metadata.get("device_id").is_some());
    assert_eq!(scan_result.metadata.get("device_id").unwrap().as_str(), "TEST-RFID-001");
    assert!(scan_result.metadata.get("power_level").is_some());
    assert!(scan_result.metadata.get("frequency").is_some());
    assert!(scan_result.metadata.get("signal_quality").is_some());
}

#[tokio::test]
async fn test_rfid_writing() {
    let mut writer = RFIDWriter::new("TEST-WRITER-001".to_string());
    writer.initialize().await.unwrap();

    let asset_id = Uuid::new_v4();
    let context = SecurityContext::new(
        SecurityClassification::Unclassified,
        Uuid::new_v4(),
        "test".to_string(),
        vec![],
    );

    // Test writing to tag
    let tag_id = writer.write_tag(asset_id, &context).await.unwrap();
    assert!(tag_id.starts_with("TAG-"));

    // Verify written data
    assert!(writer.verify_write(&tag_id, asset_id).await.unwrap());
}

#[tokio::test]
async fn test_rfid_initialization() {
    let mut writer = RFIDWriter::new("TEST-WRITER-001".to_string());
    
    // Test initial state
    assert!(!writer.initialized);
    
    // Test initialization
    writer.initialize().await.unwrap();
    assert!(writer.initialized);
    
    // Test cleanup
    writer.cleanup().await.unwrap();
    assert!(!writer.initialized);
}

#[tokio::test]
async fn test_rfid_error_handling() {
    let mut writer = RFIDWriter::new("TEST-WRITER-001".to_string());

    // Test scanning without initialization
    let data = b"test data";
    let result = writer.scan(data).await;
    assert!(matches!(result, Err(ScanError::DeviceError(_))));

    // Test writing without initialization
    let asset_id = Uuid::new_v4();
    let context = SecurityContext::new(
        SecurityClassification::Unclassified,
        Uuid::new_v4(),
        "test".to_string(),
        vec![],
    );
    let result = writer.write_tag(asset_id, &context).await;
    assert!(matches!(result, Err(ScanError::DeviceError(_))));

    // Test verification without initialization
    let result = writer.verify_write("TAG-123", asset_id).await;
    assert!(matches!(result, Err(ScanError::DeviceError(_))));
}

#[tokio::test]
async fn test_rfid_metadata() {
    let writer = RFIDWriter::new("TEST-WRITER-001".to_string());
    
    let data = b"test rfid data";
    let scan_result = writer.scan(data).await.unwrap();
    
    // Verify metadata fields
    let metadata = scan_result.metadata;
    assert!(metadata.get("device_id").is_some());
    assert!(metadata.get("power_level").is_some());
    assert!(metadata.get("frequency").is_some());
    assert!(metadata.get("signal_quality").is_some());
    
    // Verify metadata values
    assert_eq!(metadata.get("device_id").unwrap().as_str(), "TEST-WRITER-001");
    assert_eq!(metadata.get("power_level").unwrap().as_i64().unwrap(), 30); // Default power level
    assert_eq!(metadata.get("frequency").unwrap().as_f64().unwrap(), 915.0); // Default frequency
    let signal_quality = metadata.get("signal_quality").unwrap().as_f64().unwrap();
    assert!(signal_quality > 0.0 && signal_quality <= 1.0);
}
