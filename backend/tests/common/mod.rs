#[cfg(test)]
pub mod test_utils {
    use actix_web::{App, web::Data, body::BoxBody};
    use uuid::Uuid;
    use chrono::Utc;
    use std::collections::{HashMap, HashSet};
    use std::sync::Arc;
    use async_trait::async_trait;
    use handreceipt::{
        domain::{
            property::entity::{Property, PropertyCategory, PropertyStatus},
            models::{
                qr::QRData,
                location::Location,
            },
        },
        types::{
            security::{SecurityContext, Role, SecurityClassification},
            app::{CoreService, AppStatus},
            permissions::Permission,
        },
        api::routes,
        error::CoreError,
    };

    pub struct TestContext {
        pub user: TestUser,
        pub property: Property,
        pub qr_code: QRData,
    }

    pub struct TestUser {
        pub id: i32,
        pub token: String,
    }

    pub struct TestApp {
        pub security_context: SecurityContext,
    }

    #[async_trait]
    impl CoreService for TestApp {
        async fn initialize(&self) -> Result<(), CoreError> {
            Ok(())
        }

        async fn shutdown(&self) -> Result<(), CoreError> {
            Ok(())
        }

        async fn health_check(&self) -> Result<bool, CoreError> {
            Ok(true)
        }

        async fn get_status(&self) -> Result<AppStatus, CoreError> {
            Ok(AppStatus {
                healthy: true,
                uptime: 0,
                version: "test".to_string(),
                environment: "test".to_string(),
            })
        }
    }

    pub fn create_test_app() -> App<
        impl actix_web::dev::ServiceFactory<
            actix_web::dev::ServiceRequest,
            Config = (),
            Response = actix_web::dev::ServiceResponse<BoxBody>,
            Error = actix_web::Error,
            InitError = (),
        >,
    > {
        let mut security_context = SecurityContext {
            user_id: 1,
            name: "Test Officer".to_string(),
            role: Role::Officer,
            unit: "Test Unit".to_string(),
            unit_code: "TEST-1".to_string(),
            classification: SecurityClassification::Unclassified,
            roles: HashSet::from([Role::Officer]),
            permissions: vec![
                Permission::ViewProperty,
                Permission::CreateProperty,
                Permission::ViewTransfer,
                Permission::CreateTransfer,
            ],
            metadata: HashMap::new(),
        };

        let test_app = TestApp {
            security_context: security_context.clone(),
        };

        let security_context = Data::new(security_context);
        let core_service = Data::new(test_app);
        
        App::new()
            .app_data(security_context)
            .app_data(core_service)
            .configure(routes::configure_routes)
    }

    pub async fn create_test_user(role: &str, rank: &str) -> TestUser {
        TestUser {
            id: rand::random::<i32>(),
            token: format!("test_token_{}_{}", role, rank),
        }
    }

    pub async fn create_test_property(name: &str, is_sensitive: bool) -> Property {
        let now = Utc::now();
        Property {
            id: rand::random::<i32>(),
            name: name.to_string(),
            description: format!("Description for {}", name),
            category: PropertyCategory::Equipment,
            status: PropertyStatus::Available,
            current_holder_id: 1,
            location: Location {
                latitude: 37.7749,
                longitude: -122.4194,
                altitude: Some(0.0),
                accuracy: Some(1.0),
                building: Some("Test Building".to_string()),
                floor: Some(1),
                room: Some("101".to_string()),
            },
            metadata: serde_json::json!({}),
            created_at: now,
            updated_at: now,
            is_sensitive,
            quantity: 1,
            notes: None,
            serial_number: None,
            nsn: None,
            hand_receipt_number: None,
            requires_approval: false,
        }
    }

    pub async fn create_test_qr_code(property_id: i32) -> QRData {
        QRData {
            id: Uuid::new_v4(),
            property_id,
            custodian_id: "1".to_string(),
            timestamp: Utc::now(),
            metadata: serde_json::json!({
                "qr_code": format!("QR_{}", Uuid::new_v4())
            }),
            signature: "test_signature".to_string(),
            public_key: "test_public_key".to_string(),
        }
    }

    pub async fn create_test_qr_code_with_timestamp(
        property_id: i32,
        timestamp: chrono::DateTime<Utc>,
    ) -> QRData {
        QRData {
            id: Uuid::new_v4(),
            property_id,
            custodian_id: "1".to_string(),
            timestamp,
            metadata: serde_json::json!({
                "qr_code": format!("QR_{}", Uuid::new_v4())
            }),
            signature: "test_signature".to_string(),
            public_key: "test_public_key".to_string(),
        }
    }

    impl TestContext {
        pub async fn new(role: &str) -> Self {
            let user = create_test_user(role, "TEST_RANK").await;
            let property = create_test_property("test_property", false).await;
            let qr_code = create_test_qr_code(property.id).await;

            Self {
                user,
                property,
                qr_code,
            }
        }
    }
}
