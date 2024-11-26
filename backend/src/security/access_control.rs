use serde::{Serialize, Deserialize};
use std::collections::HashSet;

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
pub enum Role {
    Officer,
    NCO,
    Soldier,
}

impl Role {
    pub fn permissions(&self) -> HashSet<Permission> {
        match self {
            Role::Officer => {
                let mut perms = HashSet::new();
                perms.insert(Permission::ViewProperty);
                perms.insert(Permission::CreateProperty);
                perms.insert(Permission::UpdateProperty);
                perms.insert(Permission::DeleteProperty);
                perms.insert(Permission::ViewTransfer);
                perms.insert(Permission::CreateTransfer);
                perms.insert(Permission::ApproveTransfer);
                perms.insert(Permission::ViewAuditLog);
                perms.insert(Permission::GenerateQRCode);
                perms.insert(Permission::ViewAnalytics);
                perms
            }
            Role::NCO => {
                let mut perms = HashSet::new();
                perms.insert(Permission::ViewProperty);
                perms.insert(Permission::CreateProperty);
                perms.insert(Permission::UpdateProperty);
                perms.insert(Permission::ViewTransfer);
                perms.insert(Permission::CreateTransfer);
                perms.insert(Permission::GenerateQRCode);
                perms.insert(Permission::ViewAnalytics);
                perms
            }
            Role::Soldier => {
                let mut perms = HashSet::new();
                perms.insert(Permission::ViewProperty);
                perms.insert(Permission::ViewTransfer);
                perms.insert(Permission::CreateTransfer);
                perms
            }
        }
    }

    pub fn has_permission(&self, permission: &Permission) -> bool {
        self.permissions().contains(permission)
    }
} 