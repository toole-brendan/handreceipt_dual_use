mod auth;

pub use auth::{
    Authorization,
    AuthRequirements,
    RequiredRank,
    AuthInfoExtractor,
};

/// Helper function to create authorization middleware for property management
pub fn property_auth(config: crate::api::auth::AuthConfig) -> Authorization {
    // Property management requires at least NCO rank and supply chain role
    Authorization::new(
        config,
        AuthRequirements {
            required_rank: RequiredRank::NCO,
            supply_chain_only: true,
            same_unit_only: false,
        },
    )
}

/// Helper function to create authorization middleware for property transfers
pub fn transfer_auth(config: crate::api::auth::AuthConfig) -> Authorization {
    // Transfers can be done by any rank, but require same unit access
    Authorization::new(
        config,
        AuthRequirements {
            required_rank: RequiredRank::Any,
            supply_chain_only: false,
            same_unit_only: true,
        },
    )
}

/// Helper function to create authorization middleware for property reports
pub fn report_auth(config: crate::api::auth::AuthConfig) -> Authorization {
    // Reports require officer rank
    Authorization::officer(config)
}

/// Helper function to create authorization middleware for sensitive items
pub fn sensitive_items_auth(config: crate::api::auth::AuthConfig) -> Authorization {
    // Sensitive items require senior NCO or officer rank
    Authorization::senior_nco(config)
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::test;
    use uuid::Uuid;
    use crate::api::auth::{AuthConfig, Claims, Rank, UnitInfo};

    #[actix_web::test]
    async fn test_property_auth() {
        let config = AuthConfig::new(
            "test_secret".to_string(),
            chrono::Duration::hours(1),
        );

        // Test with supply sergeant
        let claims = Claims {
            sub: Uuid::new_v4(),
            name: "Test NCO".to_string(),
            rank: Rank::SergeantFirstClass,
            unit: UnitInfo {
                unit_id: "1-1-IN".to_string(),
                parent_unit: None,
                position: "Supply Sergeant".to_string(),
                duty_position: Some("Supply Sergeant".to_string()),
            },
            exp: (chrono::Utc::now() + chrono::Duration::hours(1)).timestamp(),
            iat: chrono::Utc::now().timestamp(),
        };

        let token = config.create_token(claims).unwrap();
        let req = test::TestRequest::default()
            .insert_header(("Authorization", format!("Bearer {}", token)))
            .to_srv_request();

        let auth = property_auth(config.clone());
        let resp = auth
            .new_transform(test::ok_service())
            .await
            .unwrap()
            .call(req)
            .await;

        assert!(resp.is_ok());
    }

    #[actix_web::test]
    async fn test_sensitive_items_auth() {
        let config = AuthConfig::new(
            "test_secret".to_string(),
            chrono::Duration::hours(1),
        );

        // Test with senior NCO
        let claims = Claims {
            sub: Uuid::new_v4(),
            name: "Test Senior NCO".to_string(),
            rank: Rank::FirstSergeant,
            unit: UnitInfo {
                unit_id: "1-1-IN".to_string(),
                parent_unit: None,
                position: "First Sergeant".to_string(),
                duty_position: None,
            },
            exp: (chrono::Utc::now() + chrono::Duration::hours(1)).timestamp(),
            iat: chrono::Utc::now().timestamp(),
        };

        let token = config.create_token(claims).unwrap();
        let req = test::TestRequest::default()
            .insert_header(("Authorization", format!("Bearer {}", token)))
            .to_srv_request();

        let auth = sensitive_items_auth(config.clone());
        let resp = auth
            .new_transform(test::ok_service())
            .await
            .unwrap()
            .call(req)
            .await;

        assert!(resp.is_ok());
    }
}
