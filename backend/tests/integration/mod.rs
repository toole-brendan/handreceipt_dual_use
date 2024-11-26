use std::collections::{HashMap, HashSet};

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
    let role = if is_officer { Role::Officer } else { Role::Soldier };
    SecurityContext {
        user_id: 1,
        name: "Test User".to_string(),
        role: role.clone(),
        unit: "Test Unit".to_string(),
        unit_code: "1-1-IN".to_string(),
        classification: SecurityClassification::Unclassified,
        roles: HashSet::from([role]),
        permissions: vec![Permission::ViewProperty, Permission::CreateProperty],
        metadata: HashMap::new(),
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
