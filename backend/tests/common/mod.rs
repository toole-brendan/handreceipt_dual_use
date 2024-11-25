#[cfg(test)]
pub mod test_utils {
    use actix_web::{App, web::Data, body::BoxBody};
    use uuid::Uuid;
    use chrono::Utc;
    use std::collections::HashMap;
    use handreceipt::{
        domain::{
            property::entity::{Property, PropertyCategory},
            models::qr::QRData,
        },
        types::security::{SecurityContext, Role, SecurityClassification},
    };

    pub struct TestContext {
        pub user: TestUser,
        pub property: Property,
        pub qr_code: QRData,
    }

    pub struct TestUser {
        pub id: Uuid,
        pub token: String,
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
        let mut security_context = SecurityContext::new(Uuid::new_v4());
        security_context.roles = vec![Role::Officer];
        security_context.unit_code = "test_unit".to_string();
        security_context.metadata = HashMap::new();
        security_context.permissions = vec![];
        security_context.classification = SecurityClassification::Unclassified;
        let security_context = Data::new(security_context);
        
        App::new()
            .app_data(security_context)
    }

    pub async fn create_test_user(role: &str, rank: &str) -> TestUser {
        TestUser {
            id: Uuid::new_v4(),
            token: format!("test_token_{}_{}", role, rank),
        }
    }

    pub async fn create_test_property(name: &str, is_sensitive: bool) -> Property {
        Property::new(
            name.to_string(),
            format!("Description for {}", name),
            PropertyCategory::Equipment,
            is_sensitive,
            1,
            "Each".to_string(),
        ).expect("Failed to create test property")
    }

    pub async fn create_test_qr_code(property_id: Uuid) -> QRData {
        QRData {
            id: Uuid::new_v4(),
            property_id,
            timestamp: Utc::now(),
            metadata: serde_json::json!({
                "qr_code": format!("QR_{}", Uuid::new_v4())
            }),
        }
    }

    pub async fn create_test_qr_code_with_timestamp(
        property_id: Uuid,
        timestamp: chrono::DateTime<Utc>,
    ) -> QRData {
        QRData {
            id: Uuid::new_v4(),
            property_id,
            timestamp,
            metadata: serde_json::json!({
                "qr_code": format!("QR_{}", Uuid::new_v4())
            }),
        }
    }

    impl TestContext {
        pub async fn new(role: &str) -> Self {
            let user = create_test_user(role, "TEST_RANK").await;
            let property = create_test_property("test_property", false).await;
            let qr_code = create_test_qr_code(property.id()).await;

            Self {
                user,
                property,
                qr_code,
            }
        }
    }
}
