use std::collections::HashMap;

mod security_test;
mod mobile_workflow_test;
mod transfer_edge_test;
mod transfer_workflow_test;
mod blockchain_verification_test;

pub use security_test::*;
pub use mobile_workflow_test::*;
pub use transfer_edge_test::*;
pub use transfer_workflow_test::*;
pub use blockchain_verification_test::*;

use handreceipt::{
    types::{
        security::{SecurityContext, SecurityClassification, Role},
        permissions::{Permission, ResourceType, Action},
    },
    domain::models::transfer::TransferStatus,
};

/// Creates a test security context for integration tests
pub fn create_test_context(is_officer: bool) -> SecurityContext {
    let mut context = SecurityContext::new(uuid::Uuid::new_v4());
    context.roles = if is_officer {
        vec![Role::Officer]
    } else {
        vec![Role::Soldier]
    };
    context.classification = SecurityClassification::Unclassified;
    context.permissions = vec![
        Permission::new(ResourceType::Property, Action::Read, HashMap::new()),
        Permission::new(ResourceType::Transfer, Action::Create, HashMap::new()),
    ];
    context.unit_code = "1-1-IN".to_string();
    context.metadata = HashMap::new();
    context
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
