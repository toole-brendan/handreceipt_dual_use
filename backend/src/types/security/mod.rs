pub mod key_management;

use serde::{Deserialize, Serialize};
use uuid::Uuid;
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use crate::types::permissions::{Permission, ResourceType, Action};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum Role {
    Officer,
    NCO,
    Soldier,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum SecurityClassification {
    Unclassified,
    Sensitive,
    Classified,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityContext {
    pub user_id: Uuid,
    pub classification: SecurityClassification,
    pub permissions: Vec<Permission>,
    pub roles: Vec<Role>,
    pub unit_code: String,
    pub metadata: HashMap<String, String>,
}

impl SecurityContext {
    pub fn new(user_id: Uuid) -> Self {
        Self {
            user_id,
            classification: SecurityClassification::Unclassified,
            permissions: Vec::new(),
            roles: Vec::new(),
            unit_code: String::new(),
            metadata: HashMap::new(),
        }
    }

    pub fn is_officer(&self) -> bool {
        self.roles.contains(&Role::Officer)
    }

    pub fn is_nco(&self) -> bool {
        self.roles.contains(&Role::NCO)
    }

    pub fn can_handle_sensitive_items(&self) -> bool {
        self.is_officer() || self.is_nco()
    }

    pub fn can_access_location(&self, location: &str) -> bool {
        !self.unit_code.is_empty()
    }

    pub fn has_permission(&self, resource_type: ResourceType, action: Action) -> bool {
        self.permissions.iter().any(|p| 
            p.resource_type == resource_type && p.action == action
        )
    }

    pub fn has_permission_for_sensitive_items(&self) -> bool {
        self.can_handle_sensitive_items() && 
        self.has_permission(ResourceType::Property, Action::HandleSensitive)
    }

    pub fn can_view_user_profile(&self, profile_id: Uuid) -> bool {
        // Users can view their own profile
        if self.user_id == profile_id {
            return true;
        }

        // Officers and NCOs can view profiles in their command
        if (self.is_officer() || self.is_nco()) && self.has_permission(ResourceType::User, Action::ViewCommand) {
            return true;
        }

        // Users with explicit permission
        self.has_permission(ResourceType::User, Action::ViewAll)
    }

    pub fn can_update_user_profile(&self, profile_id: Uuid) -> bool {
        // Users can update their own profile
        if self.user_id == profile_id {
            return true;
        }

        // Officers can update profiles in their command
        if self.is_officer() && self.has_permission(ResourceType::User, Action::UpdateCommand) {
            return true;
        }

        // Admin users with explicit permission
        self.has_permission(ResourceType::User, Action::UpdateAll)
    }

    pub fn can_view_command_users(&self) -> bool {
        (self.is_officer() || self.is_nco()) && 
        self.has_permission(ResourceType::User, Action::ViewCommand)
    }

    pub fn can_approve_for_command(&self, command_id: &str) -> bool {
        // Check if user is an officer
        if !self.is_officer() {
            return false;
        }

        // Check if user has command approval permission
        if !self.has_permission(ResourceType::Transfer, Action::ApproveCommand) {
            return false;
        }

        // Check if user belongs to the same command
        self.unit_code.starts_with(command_id)
    }
}

impl Default for SecurityContext {
    fn default() -> Self {
        Self {
            user_id: Uuid::new_v4(),
            classification: SecurityClassification::Unclassified,
            permissions: Vec::new(),
            roles: Vec::new(),
            unit_code: String::new(),
            metadata: HashMap::new(),
        }
    }
}

impl Default for SecurityClassification {
    fn default() -> Self {
        SecurityClassification::Unclassified
    }
}