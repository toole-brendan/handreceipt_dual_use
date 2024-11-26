use crate::security::{
    access_control::{Permission, Role},
    auth::Claims,
};

#[derive(Debug, Clone)]
pub struct SecurityContext {
    pub user_id: i32,
    pub name: String,
    pub role: Role,
    pub unit: String,
}

impl SecurityContext {
    pub fn from_claims(claims: Claims) -> Self {
        Self {
            user_id: claims.sub,
            name: claims.name,
            role: claims.role,
            unit: claims.unit,
        }
    }

    pub fn has_permission(&self, permission: Permission) -> bool {
        self.role.has_permission(&permission)
    }

    pub fn is_officer(&self) -> bool {
        matches!(self.role, Role::Officer)
    }

    pub fn is_nco(&self) -> bool {
        matches!(self.role, Role::NCO)
    }

    pub fn can_approve_transfers(&self) -> bool {
        self.has_permission(Permission::ApproveTransfer)
    }

    pub fn can_generate_qr(&self) -> bool {
        self.has_permission(Permission::GenerateQRCode)
    }

    pub fn can_view_analytics(&self) -> bool {
        self.has_permission(Permission::ViewAnalytics)
    }

    pub fn can_manage_property(&self) -> bool {
        self.has_permission(Permission::CreateProperty) && 
        self.has_permission(Permission::UpdateProperty)
    }

    pub fn can_view_audit_log(&self) -> bool {
        self.has_permission(Permission::ViewAuditLog)
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
} 