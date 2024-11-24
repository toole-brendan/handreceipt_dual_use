pub mod test_utils {
    use chrono::{DateTime, Utc};
    use uuid::Uuid;
    use actix_web::{web, App};
    use ed25519_dalek::{SigningKey, VerifyingKey};
    use std::sync::Arc;
    use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};

    use handreceipt::{
        api::routes,
        domain::{
            models::{
                qr::{QRData, QRResponse, QRFormat},
                transfer::TransferStatus,
            },
            property::{Property, PropertyStatus},
        },
        types::security::SecurityContext,
    };

    /// Test user data
    pub struct TestUser {
        pub id: String,
        pub role: String,
        pub token: String,
    }

    /// Creates a test application
    pub async fn create_test_app() -> App<
        impl actix_web::dev::ServiceFactory<
            actix_web::dev::ServiceRequest,
            Config = (),
            Error = actix_web::Error,
            InitError = (),
        >,
    > {
        // Initialize test services
        let property_service = Arc::new(create_test_property_service());
        let transfer_service = Arc::new(create_test_transfer_service());
        let qr_service = Arc::new(create_test_qr_service());

        // Create app with test configuration
        App::new()
            .app_data(web::Data::new(property_service))
            .app_data(web::Data::new(transfer_service))
            .app_data(web::Data::new(qr_service))
            .configure(routes::configure)
    }

    /// Creates a test user with role
    pub async fn create_test_user(id: &str, role: &str) -> TestUser {
        // Create JWT token
        let token = format!("test_token_{}_{}", id, role);

        TestUser {
            id: id.to_string(),
            role: role.to_string(),
            token,
        }
    }

    /// Creates a test property
    pub async fn create_test_property(name: &str, is_sensitive: bool) -> Property {
        Property::new(
            name.to_string(),
            "Test Description".to_string(),
            None, // NSN
            is_sensitive,
            1,    // Quantity
            "Each".to_string(),
        ).unwrap()
    }

    /// Creates a test QR code
    pub async fn create_test_qr_code(property_id: Uuid) -> QRResponse {
        create_test_qr_code_with_timestamp(property_id, Utc::now()).await
    }

    /// Creates a test QR code with specific timestamp
    pub async fn create_test_qr_code_with_timestamp(
        property_id: Uuid,
        timestamp: DateTime<Utc>,
    ) -> QRResponse {
        // Create signing key for tests
        let signing_key = SigningKey::generate(&mut rand::thread_rng());
        
        // Create message to sign
        let msg = format!("{}:{}", property_id, timestamp.timestamp());
        let signature = signing_key.sign(msg.as_bytes());

        // Create QR data
        let qr_data = QRData {
            property_id,
            timestamp,
            signature: BASE64.encode(signature.to_bytes()),
        };

        // Convert to QR code
        let qr_json = serde_json::to_string(&qr_data).unwrap();

        QRResponse {
            qr_code: qr_json,
            property_id,
            generated_at: timestamp,
            format: QRFormat::PNG,
        }
    }

    /// Creates test property service
    fn create_test_property_service() -> impl handreceipt::domain::property::PropertyService {
        // Implement mock property service for tests
        unimplemented!("Implement mock property service")
    }

    /// Creates test transfer service
    fn create_test_transfer_service() -> impl handreceipt::domain::transfer::TransferService {
        // Implement mock transfer service for tests
        unimplemented!("Implement mock transfer service")
    }

    /// Creates test QR service
    fn create_test_qr_service() -> impl handreceipt::domain::models::qr::QRCodeService {
        // Implement mock QR service for tests
        unimplemented!("Implement mock QR service")
    }

    /// Test context builder
    pub struct TestContext {
        pub user: TestUser,
        pub property: Property,
        pub qr_code: QRResponse,
    }

    impl TestContext {
        /// Creates a new test context
        pub async fn new(user_role: &str) -> Self {
            let user = create_test_user("TEST_USER", user_role).await;
            let property = create_test_property("Test Item", false).await;
            let qr_code = create_test_qr_code(property.id()).await;

            Self {
                user,
                property,
                qr_code,
            }
        }

        /// Creates a test context for sensitive items
        pub async fn new_sensitive() -> Self {
            let user = create_test_user("TEST_USER", "OFFICER").await;
            let property = create_test_property("Sensitive Item", true).await;
            let qr_code = create_test_qr_code(property.id()).await;

            Self {
                user,
                property,
                qr_code,
            }
        }
    }
}
