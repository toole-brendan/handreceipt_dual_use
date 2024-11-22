use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone, Hash, Eq, PartialEq)]
pub struct Permission {
    pub resource_type: ResourceType,
    pub action: Action,
}

#[derive(Debug, Clone, Hash, Eq, PartialEq)]
pub enum ResourceType {
    Asset,
    Location,
    Transfer,
    User,
    Report,
    System,
    Custom(String),
}

#[derive(Debug, Clone, Hash, Eq, PartialEq)]
pub enum Action {
    Create,
    Read,
    Update,
    Delete,
    Execute,
    Transfer,
    Scan,
    Custom(String),
}

#[derive(Debug, Clone)]
pub struct Role {
    pub id: String,
    pub name: String,
    pub permissions: HashSet<Permission>,
}

pub struct AccessControl {
    roles: Arc<RwLock<HashMap<String, Role>>>,
    user_roles: Arc<RwLock<HashMap<String, HashSet<String>>>>,
}

impl AccessControl {
    pub fn new() -> Self {
        Self {
            roles: Arc::new(RwLock::new(HashMap::new())),
            user_roles: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn create_role(&self, name: &str, permissions: HashSet<Permission>) -> Result<String, AccessControlError> {
        let role_id = uuid::Uuid::new_v4().to_string();
        let role = Role {
            id: role_id.clone(),
            name: name.to_string(),
            permissions,
        };

        let mut roles = self.roles.write().await;
        roles.insert(role_id.clone(), role);

        Ok(role_id)
    }

    pub async fn assign_role(&self, user_id: &str, role_id: &str) -> Result<(), AccessControlError> {
        // Verify role exists
        let roles = self.roles.read().await;
        if !roles.contains_key(role_id) {
            return Err(AccessControlError::RoleNotFound);
        }

        let mut user_roles = self.user_roles.write().await;
        user_roles
            .entry(user_id.to_string())
            .or_insert_with(HashSet::new)
            .insert(role_id.to_string());

        Ok(())
    }

    pub async fn has_permission(
        &self,
        user_id: &str,
        resource_type: ResourceType,
        action: Action,
    ) -> Result<bool, AccessControlError> {
        let permission = Permission {
            resource_type,
            action,
        };

        let user_roles = self.user_roles.read().await;
        let roles = self.roles.read().await;

        let user_role_ids = user_roles.get(user_id)
            .ok_or(AccessControlError::UserNotFound)?;

        for role_id in user_role_ids {
            if let Some(role) = roles.get(role_id) {
                if role.permissions.contains(&permission) {
                    return Ok(true);
                }
            }
        }

        Ok(false)
    }

    pub async fn get_user_permissions(&self, user_id: &str) -> Result<HashSet<Permission>, AccessControlError> {
        let user_roles = self.user_roles.read().await;
        let roles = self.roles.read().await;

        let user_role_ids = user_roles.get(user_id)
            .ok_or(AccessControlError::UserNotFound)?;

        let mut permissions = HashSet::new();
        for role_id in user_role_ids {
            if let Some(role) = roles.get(role_id) {
                permissions.extend(role.permissions.clone());
            }
        }

        Ok(permissions)
    }

    pub async fn remove_role(&self, user_id: &str, role_id: &str) -> Result<(), AccessControlError> {
        let mut user_roles = self.user_roles.write().await;
        
        if let Some(roles) = user_roles.get_mut(user_id) {
            roles.remove(role_id);
            Ok(())
        } else {
            Err(AccessControlError::UserNotFound)
        }
    }

    pub async fn delete_role(&self, role_id: &str) -> Result<(), AccessControlError> {
        let mut roles = self.roles.write().await;
        if roles.remove(role_id).is_none() {
            return Err(AccessControlError::RoleNotFound);
        }

        // Remove role from all users
        let mut user_roles = self.user_roles.write().await;
        for roles in user_roles.values_mut() {
            roles.remove(role_id);
        }

        Ok(())
    }
}

#[derive(Debug)]
pub enum AccessControlError {
    RoleNotFound,
    UserNotFound,
    PermissionDenied,
    InvalidRole(String),
    InvalidPermission(String),
}
