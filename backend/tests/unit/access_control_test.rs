use handreceipt::types::{
    security::{SecurityContext, Role},
    permissions::{ResourceType, Action, Permission}
};
use uuid::Uuid;

#[test]
fn test_basic_permissions() {
    let user_id = Uuid::new_v4();
    let mut context = SecurityContext::new(user_id);
    context.permissions = vec![Permission {
        resource_type: ResourceType::Property,
        action: Action::Read,
        constraints: Default::default(),
    }];
    
    assert!(context.has_permission(ResourceType::Property, Action::Read));
    assert!(!context.has_permission(ResourceType::Property, Action::Delete));
    assert!(!context.has_permission(ResourceType::Transfer, Action::Read));
}

#[test]
fn test_role_based_access() {
    let mut context = SecurityContext::new(Uuid::new_v4());
    
    // Test Officer role
    context.roles = vec![Role::Officer];
    assert!(context.is_officer());
    assert!(!context.is_nco());
    assert!(context.can_handle_sensitive_items());

    // Test NCO role
    context.roles = vec![Role::NCO];
    assert!(!context.is_officer());
    assert!(context.is_nco());
    assert!(context.can_handle_sensitive_items());

    // Test Soldier role
    context.roles = vec![Role::Soldier];
    assert!(!context.is_officer());
    assert!(!context.is_nco());
    assert!(!context.can_handle_sensitive_items());
}

#[test]
fn test_command_level_permissions() {
    let mut context = SecurityContext::new(Uuid::new_v4());
    context.roles = vec![Role::Officer];
    context.unit_code = "1-1-IN".to_string();
    context.permissions.extend(vec![
        Permission {
            resource_type: ResourceType::User,
            action: Action::ViewCommand,
            constraints: Default::default(),
        },
        Permission {
            resource_type: ResourceType::Transfer,
            action: Action::ApproveCommand,
            constraints: Default::default(),
        }
    ]);
    
    assert!(context.can_view_command_users());
    assert!(context.can_access_location("FOB-1"));
    assert!(context.can_approve_for_command("1-1"));
    assert!(!context.can_approve_for_command("2-1")); // Different command
}

#[test]
fn test_sensitive_item_handling() {
    let mut context = SecurityContext::new(Uuid::new_v4());
    
    // NCO with sensitive item permission
    context.roles = vec![Role::NCO];
    context.permissions = vec![Permission {
        resource_type: ResourceType::Property,
        action: Action::HandleSensitive,
        constraints: Default::default(),
    }];
    assert!(context.has_permission_for_sensitive_items());

    // Soldier should not handle sensitive items even with permission
    context.roles = vec![Role::Soldier];
    assert!(!context.has_permission_for_sensitive_items());
} 