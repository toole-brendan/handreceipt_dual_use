use crate::setup;

mod mobile_workflow_test;
mod transfer_workflow_test;
mod security_test;
mod transfer_edge_test;

/// Setup for integration tests
#[cfg(test)]
pub fn integration_setup() {
    setup();
}

/// Test utilities for integration tests
pub mod test_utils {
    use super::*;
    use crate::common::test_utils::*;
    use handreceipt::types::security::SecurityContext;
    use chrono::Utc;
    use uuid::Uuid;

    /// Creates a test transfer context
    pub async fn create_transfer_context(
        property_id: Uuid,
        from_user: &str,
        to_user: &str,
    ) -> (String, String, String) {
        let qr_code = create_test_qr_code(property_id).await;
        
        (
            qr_code.qr_code,
            format!("test_token_{}", from_user),
            format!("test_token_{}", to_user),
        )
    }
}
