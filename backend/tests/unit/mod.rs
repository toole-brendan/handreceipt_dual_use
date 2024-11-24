use crate::setup;

mod access_control_test;
mod error_test;
mod scanning;

/// Setup for unit tests
#[cfg(test)]
pub fn unit_setup() {
    setup();
}

/// Test utilities for unit tests
pub mod test_utils {
    use super::*;
    use crate::common::test_utils::*;
    use handreceipt::types::security::SecurityContext;

    /// Creates a test security context
    pub fn create_test_context(role: &str) -> SecurityContext {
        SecurityContext::new(format!("test_user_{}", role))
    }
}
