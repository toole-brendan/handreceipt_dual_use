use handreceipt::types::{
    security::{SecurityContext, Role, SecurityClassification},
    permissions::{Permission}
};

#[test]
fn test_basic_permissions() {
    let user_id = 1;
    let mut context = SecurityContext::new(user_id);
    context.role = Role::Soldier;
    context.permissions = vec![Permission::ViewProperty];
    
    assert!(context.has_permission(&Permission::ViewProperty));
    assert!(!context.has_permission(&Permission::DeleteProperty));
    assert!(context.has_permission(&Permission::ViewTransfer));
}

#[test]
fn test_role_based_access() {
    let mut context = SecurityContext::new(1);
    
    // Test Officer role
    context.role = Role::Officer;
    assert!(context.is_officer());
    assert!(!context.is_nco());
    context.classification = SecurityClassification::Secret;
    assert!(context.can_handle_sensitive_items());

    // Test NCO role
    context.role = Role::NCO;
    assert!(!context.is_officer());
    assert!(context.is_nco());
    assert!(context.can_handle_sensitive_items());

    // Test Soldier role
    context.role = Role::Soldier;
    assert!(!context.is_officer());
    assert!(!context.is_nco());
    context.classification = SecurityClassification::Unclassified;
    assert!(!context.can_handle_sensitive_items());
}

#[test]
fn test_command_level_permissions() {
    let mut context = SecurityContext::new(1);
    context.role = Role::Officer;
    context.unit_code = "1-1-IN".to_string();
    context.permissions = vec![
        Permission::ViewProperty,
        Permission::ApproveTransfer
    ];
    
    assert!(context.can_view_command_users());
    assert!(context.can_access_location("FOB-1"));
    assert!(context.can_approve_transfers());
}

#[test]
fn test_property_permissions() {
    let mut context = SecurityContext::new(1);
    
    // Officer should have all permissions by default
    context.role = Role::Officer;
    assert!(context.can_create_property());
    assert!(context.can_read_property());
    
    // NCO should have property create/read permissions by default
    context.role = Role::NCO;
    assert!(context.can_create_property());
    assert!(context.can_read_property());
    
    // Soldier should only have read permissions
    context.role = Role::Soldier;
    assert!(!context.can_create_property());
    assert!(context.can_read_property());
    
    // Test explicit permission override
    context.permissions = vec![Permission::CreateProperty];
    assert!(context.can_create_property());
} 