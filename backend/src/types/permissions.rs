use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Permission {
    ViewProperty,
    CreateProperty,
    UpdateProperty,
    DeleteProperty,
    ViewTransfer,
    CreateTransfer,
    ApproveTransfer,
    ViewAuditLog,
    GenerateQRCode,
    ViewAnalytics,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ResourceType {
    Property,
    Transfer,
    User,
    AuditLog,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Action {
    View,
    Create,
    Update,
    Delete,
    Approve,
    Generate,
    Read,
    Write,
    Execute,
    ApproveCommand,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_permission_creation() {
        let permission = Permission::ViewProperty;

        assert_eq!(permission, Permission::ViewProperty);
    }
}
