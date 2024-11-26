use handreceipt::types::{
    security::{SecurityContext, SecurityClassification, Role},
    permissions::Permission,
};

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_security_classification_ordering() {
        // Test using partial ordering
        assert!(SecurityClassification::TopSecret > SecurityClassification::Secret);
        assert!(SecurityClassification::Secret > SecurityClassification::Confidential);
        assert!(SecurityClassification::Confidential > SecurityClassification::Unclassified);
        
        // Test equality
        assert!(SecurityClassification::Secret == SecurityClassification::Secret);
        
        // Test using comparison operators
        assert!(SecurityClassification::TopSecret >= SecurityClassification::Secret);
        assert!(SecurityClassification::Secret >= SecurityClassification::Confidential);
    }

    #[test]
    fn test_security_context_permissions() {
        let user_id = 1;
        let mut context = SecurityContext::new(user_id);
        
        // Test with Soldier role (minimal permissions)
        context.role = Role::Soldier;
        context.permissions = vec![Permission::ViewProperty];

        // Should have ViewProperty from both role and explicit permission
        assert!(context.has_permission(&Permission::ViewProperty));
        // Should have ViewTransfer from Soldier role
        assert!(context.has_permission(&Permission::ViewTransfer));
        // Should not have CreateProperty (neither from role nor explicit)
        assert!(!context.has_permission(&Permission::CreateProperty));

        // Test with Officer role (all permissions)
        context.role = Role::Officer;
        assert!(context.has_permission(&Permission::CreateProperty));
        assert!(context.has_permission(&Permission::DeleteProperty));
        assert!(context.has_permission(&Permission::ViewTransfer));
    }

    #[test]
    fn test_security_context_roles() {
        let user_id = 1;
        let mut context = SecurityContext::new(user_id);
        
        // Test default roles
        assert!(!context.is_officer());
        assert!(!context.is_nco());
        
        // Set officer role
        context.role = Role::Officer;
        assert!(context.is_officer());
        context.classification = SecurityClassification::Secret;
        assert!(context.can_handle_sensitive_items());
    }

    #[test]
    fn test_security_context_sensitive_items() {
        let user_id = 1;
        let mut context = SecurityContext::new(user_id);
        
        // Add NCO role and set classification
        context.role = Role::NCO;
        context.classification = SecurityClassification::Secret;
        context.permissions = vec![Permission::ViewProperty];

        assert!(context.can_handle_sensitive_items());
    }

    #[test]
    fn test_security_context_command_access() {
        let user_id = 1;
        let mut context = SecurityContext::new(user_id);
        
        // Set up command context
        context.role = Role::Officer;
        context.unit_code = "1-1-IN".to_string();
        context.permissions = vec![Permission::ApproveTransfer];

        assert!(context.can_approve_transfers());
        assert!(context.can_view_command_users());
    }
}