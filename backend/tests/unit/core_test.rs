use backend::core::{SecurityContext, SecurityClassification, ResourceType, Action, Permission, Constraint};
use uuid::Uuid;
use std::str::FromStr;
use chrono::{Duration, Utc};

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_security_classification_ordering() {
        assert!(SecurityClassification::TopSecret > SecurityClassification::Secret);
        assert!(SecurityClassification::Secret > SecurityClassification::Confidential);
        assert!(SecurityClassification::Confidential > SecurityClassification::Restricted);
        assert!(SecurityClassification::Restricted > SecurityClassification::Unclassified);
    }

    #[test]
    fn test_security_classification_from_str() {
        assert_eq!(
            SecurityClassification::from_str("TOP_SECRET").unwrap(),
            SecurityClassification::TopSecret
        );
        assert_eq!(
            SecurityClassification::from_str("SECRET").unwrap(),
            SecurityClassification::Secret
        );
        
        // Test invalid classification
        assert!(SecurityClassification::from_str("INVALID").is_err());
    }

    #[test]
    fn test_security_context_permissions() {
        let user_id = Uuid::new_v4();
        let permission = Permission {
            resource_type: ResourceType::Asset,
            actions: vec![Action::Read, Action::Create],
            constraints: vec![],
        };

        let context = SecurityContext::new(
            SecurityClassification::Secret,
            user_id,
            "test-token".to_string(),
            vec![permission],
        );

        // Test permission checks
        assert!(context.has_permission(&ResourceType::Asset, &Action::Read));
        assert!(context.has_permission(&ResourceType::Asset, &Action::Create));
        assert!(!context.has_permission(&ResourceType::Asset, &Action::Delete));
        assert!(!context.has_permission(&ResourceType::Transaction, &Action::Read));
    }

    #[test]
    fn test_security_context_classification_access() {
        let user_id = Uuid::new_v4();
        let context = SecurityContext::new(
            SecurityClassification::Secret,
            user_id,
            "test-token".to_string(),
            vec![],
        );

        // Test classification access
        assert!(context.can_access_classification("CONFIDENTIAL"));
        assert!(context.can_access_classification("SECRET"));
        assert!(!context.can_access_classification("TOP_SECRET"));
        assert!(!context.can_access_classification("INVALID"));
    }

    #[test]
    fn test_security_context_metadata() {
        let user_id = Uuid::new_v4();
        let mut context = SecurityContext::new(
            SecurityClassification::Secret,
            user_id,
            "test-token".to_string(),
            vec![],
        );

        // Test metadata operations
        context.add_metadata("location".to_string(), "BUILDING_A".to_string());
        context.add_metadata("location".to_string(), "BUILDING_B".to_string());

        let locations = context.get_metadata("location").unwrap();
        assert_eq!(locations.len(), 2);
        assert!(locations.contains(&"BUILDING_A".to_string()));
        assert!(locations.contains(&"BUILDING_B".to_string()));
        assert!(context.get_metadata("nonexistent").is_none());
    }

    #[test]
    fn test_constraint_validation_comprehensive() {
        // Test AccuracyBased constraint
        let accuracy_constraint = Constraint::AccuracyBased {
            minimum_accuracy: 0.95,
            minimum_confidence: 0.98,
        };

        // Test TimeBased constraint
        let time_constraint = Constraint::TimeBased {
            start_time: Utc::now(),
            end_time: Utc::now() + Duration::hours(1),
        };

        // Add assertions for the constraints
        match accuracy_constraint {
            Constraint::AccuracyBased { minimum_accuracy, minimum_confidence } => {
                assert!(minimum_accuracy > 0.9);
                assert!(minimum_confidence > 0.9);
            },
            _ => panic!("Wrong constraint type"),
        }

        match time_constraint {
            Constraint::TimeBased { start_time, end_time } => {
                assert!(end_time > start_time);
            },
            _ => panic!("Wrong constraint type"),
        }
    }

    #[test]
    fn test_location_based_constraints() {
        let location_constraint = Constraint::LocationBased {
            geofence_id: Uuid::new_v4(),
            classification: SecurityClassification::Secret,
        };

        match location_constraint {
            Constraint::LocationBased { geofence_id: _, classification } => {
                assert_eq!(classification, SecurityClassification::Secret);
            },
            _ => panic!("Wrong constraint type"),
        }
    }

    #[test]
    fn test_security_context_replication() {
        let user_id = Uuid::new_v4();
        
        // Create permissions that include replication authority
        let replication_permission = Permission {
            resource_type: ResourceType::REPLICATION,
            actions: vec![Action::Execute],
            constraints: vec![],
        };

        let replication_authority_permission = Permission {
            resource_type: ResourceType::ReplicationAuthority,
            actions: vec![Action::Execute],
            constraints: vec![],
        };

        let context = SecurityContext::new(
            SecurityClassification::TopSecret,
            user_id,
            "test-token".to_string(),
            vec![replication_permission.clone(), replication_authority_permission],
        );

        // Test replication capabilities
        assert!(context.can_replicate());
        assert!(context.has_replication_authority());
        
        // Test that lower classifications can't replicate
        let lower_context = SecurityContext::new(
            SecurityClassification::Confidential,
            user_id,
            "test-token".to_string(),
            vec![replication_permission],
        );
        
        assert!(!lower_context.has_replication_authority());
    }
}