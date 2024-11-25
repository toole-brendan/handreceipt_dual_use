use handreceipt::types::{
    security::{SecurityContext, SecurityClassification, Role},
    permissions::{ResourceType, Action, Permission},
};
use uuid::Uuid;
use std::collections::HashMap;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_security_classification_ordering() {
        // Test using partial ordering
        assert!(SecurityClassification::Classified.gt(&SecurityClassification::Sensitive));
        assert!(SecurityClassification::Sensitive.gt(&SecurityClassification::Unclassified));
        
        // Test equality
        assert!(SecurityClassification::Classified.eq(&SecurityClassification::Classified));
        
        // Test using comparison operators (once PartialOrd is implemented)
        assert!(SecurityClassification::Classified >= SecurityClassification::Sensitive);
        assert!(SecurityClassification::Sensitive >= SecurityClassification::Unclassified);
    }

    #[test]
    fn test_security_context_permissions() {
        let user_id = Uuid::new_v4();
        let mut context = SecurityContext::new(user_id);
        
        // Add permissions
        let permission = Permission::new(
            ResourceType::Property,
            Action::Read,
            HashMap::new(),
        );
        context.permissions.push(permission);

        // Test permission checks
        assert!(context.has_permission(ResourceType::Property, Action::Read));
        assert!(!context.has_permission(ResourceType::Property, Action::Create));
        assert!(!context.has_permission(ResourceType::Transfer, Action::Read));
    }

    #[test]
    fn test_security_context_roles() {
        let user_id = Uuid::new_v4();
        let mut context = SecurityContext::new(user_id);
        
        // Test default roles
        assert!(!context.is_officer());
        assert!(!context.is_nco());
        
        // Add officer role
        context.roles.push(Role::Officer);
        assert!(context.is_officer());
        assert!(context.can_handle_sensitive_items());
    }

    #[test]
    fn test_security_context_sensitive_items() {
        let user_id = Uuid::new_v4();
        let mut context = SecurityContext::new(user_id);
        
        // Add NCO role and sensitive items permission
        context.roles.push(Role::NCO);
        context.permissions.push(Permission::new(
            ResourceType::Property,
            Action::HandleSensitive,
            HashMap::new(),
        ));

        assert!(context.can_handle_sensitive_items());
        assert!(context.has_permission_for_sensitive_items());
    }

    #[test]
    fn test_security_context_command_access() {
        let user_id = Uuid::new_v4();
        let mut context = SecurityContext::new(user_id);
        
        // Set up command context
        context.roles.push(Role::Officer);
        context.unit_code = "1-1-IN".to_string();
        context.permissions.push(Permission::new(
            ResourceType::Transfer,
            Action::ApproveCommand,
            HashMap::new(),
        ));

        assert!(context.can_approve_for_command("1-1"));
        assert!(!context.can_approve_for_command("2-1"));
    }
}