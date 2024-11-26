pub mod key_management;

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use crate::types::permissions::{Permission, ResourceType, Action};
use std::collections::HashSet;
use std::hash::Hash;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SecurityClassification {
    Unclassified,
    Confidential,
    Secret,
    TopSecret,
    Sensitive,
}

impl std::fmt::Display for SecurityClassification {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SecurityClassification::Unclassified => write!(f, "unclassified"),
            SecurityClassification::Confidential => write!(f, "confidential"),
            SecurityClassification::Secret => write!(f, "secret"),
            SecurityClassification::TopSecret => write!(f, "top_secret"),
            SecurityClassification::Sensitive => write!(f, "sensitive"),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Role {
    Officer,
    NCO,
    Soldier,
}

impl Role {
    pub fn has_permission(&self, permission: &Permission) -> bool {
        match self {
            Role::Officer => true, // Officers have all permissions
            Role::NCO => match permission {
                Permission::ViewProperty |
                Permission::CreateProperty |
                Permission::UpdateProperty |
                Permission::ViewTransfer |
                Permission::CreateTransfer |
                Permission::GenerateQRCode |
                Permission::ViewAnalytics => true,
                _ => false,
            },
            Role::Soldier => match permission {
                Permission::ViewProperty |
                Permission::ViewTransfer |
                Permission::CreateTransfer => true,
                _ => false,
            },
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityContext {
    pub user_id: i32,
    pub name: String,
    pub role: Role,
    pub unit: String,
    pub unit_code: String,
    pub classification: SecurityClassification,
    pub roles: HashSet<Role>,
    pub permissions: Vec<Permission>,
    pub metadata: HashMap<String, String>,
}

impl SecurityContext {
    pub fn new(user_id: i32) -> Self {
        Self {
            user_id,
            name: String::new(),
            role: Role::Soldier,
            unit: String::new(),
            unit_code: String::new(),
            classification: SecurityClassification::Unclassified,
            roles: HashSet::new(),
            permissions: Vec::new(),
            metadata: HashMap::new(),
        }
    }

    pub fn has_permission(&self, permission: &Permission) -> bool {
        self.role.has_permission(permission) || self.permissions.contains(permission)
    }

    pub fn can_access_property(&self, property_id: i32) -> bool {
        // TODO: Implement property access control
        true
    }

    pub fn can_access_location(&self, location: &str) -> bool {
        // TODO: Implement location access control
        true
    }

    pub fn can_handle_sensitive_items(&self) -> bool {
        matches!(self.classification, SecurityClassification::Secret | SecurityClassification::TopSecret)
    }

    pub fn is_officer(&self) -> bool {
        matches!(self.role, Role::Officer)
    }

    pub fn is_nco(&self) -> bool {
        matches!(self.role, Role::NCO)
    }

    pub fn can_approve_transfers(&self) -> bool {
        self.has_permission(&Permission::ApproveTransfer)
    }

    pub fn can_generate_qr(&self) -> bool {
        self.has_permission(&Permission::GenerateQRCode)
    }

    pub fn can_view_analytics(&self) -> bool {
        self.has_permission(&Permission::ViewAnalytics)
    }

    pub fn can_manage_property(&self) -> bool {
        self.has_permission(&Permission::CreateProperty) && 
        self.has_permission(&Permission::UpdateProperty)
    }

    pub fn can_view_audit_log(&self) -> bool {
        self.has_permission(&Permission::ViewAuditLog)
    }

    pub fn can_view_user_profile(&self, target_user_id: i32) -> bool {
        self.user_id == target_user_id || self.is_officer() || self.is_nco()
    }

    pub fn can_update_user_profile(&self, target_user_id: i32) -> bool {
        self.user_id == target_user_id || self.is_officer()
    }

    pub fn can_view_command_users(&self) -> bool {
        self.is_officer() || self.is_nco()
    }

    pub fn can_create_property(&self) -> bool {
        self.has_permission(&Permission::CreateProperty)
    }

    pub fn can_read_property(&self) -> bool {
        self.has_permission(&Permission::ViewProperty)
    }

    pub fn can_update_property(&self) -> bool {
        self.has_permission(&Permission::UpdateProperty)
    }

    pub fn can_delete_property(&self) -> bool {
        self.has_permission(&Permission::DeleteProperty)
    }
}

impl Default for SecurityContext {
    fn default() -> Self {
        Self {
            user_id: 0,
            classification: SecurityClassification::Unclassified,
            role: Role::Soldier,
            unit: String::new(),
            unit_code: String::new(),
            name: String::new(),
            roles: HashSet::new(),
            permissions: Vec::new(),
            metadata: HashMap::new(),
        }
    }
}

impl Default for SecurityClassification {
    fn default() -> Self {
        SecurityClassification::Unclassified
    }
}

impl PartialOrd for SecurityClassification {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        let self_val = match self {
            SecurityClassification::Unclassified => 0,
            SecurityClassification::Confidential => 1,
            SecurityClassification::Sensitive => 2,
            SecurityClassification::Secret => 3,
            SecurityClassification::TopSecret => 4,
        };
        let other_val = match other {
            SecurityClassification::Unclassified => 0,
            SecurityClassification::Confidential => 1,
            SecurityClassification::Sensitive => 2,
            SecurityClassification::Secret => 3,
            SecurityClassification::TopSecret => 4,
        };
        self_val.partial_cmp(&other_val)
    }
}

impl Ord for SecurityClassification {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        self.partial_cmp(other).unwrap()
    }
}