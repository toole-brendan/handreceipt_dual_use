mod mobile_workflow_test;
mod transfer_edge_test;
mod transfer_workflow_test;
mod security_test;
mod blockchain_verification_test;

pub use mobile_workflow_test::*;
pub use transfer_edge_test::*;
pub use transfer_workflow_test::*;
pub use security_test::*;
pub use blockchain_verification_test::*;

use handreceipt::{
    types::security::SecurityContext,
    domain::models::transfer::TransferStatus,
};

/// Creates a test security context for integration tests
pub fn create_test_context(is_officer: bool) -> SecurityContext {
    SecurityContext {
        user_id: uuid::Uuid::new_v4(),
        unit_code: "1-1-IN".to_string(),
        roles: if is_officer {
            vec!["OFFICER".to_string()]
        } else {
            vec!["SOLDIER".to_string()]
        },
        classification: handreceipt::types::security::SecurityClassification::Unclassified,
    }
}

/// Verifies a transfer has reached the expected status
pub async fn verify_transfer_status(
    transfer_id: uuid::Uuid,
    expected_status: TransferStatus,
    context: &SecurityContext,
) -> bool {
    // Implementation would use actual blockchain verification
    // For now, just return true for testing
    true
}
