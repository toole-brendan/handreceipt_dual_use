use actix_web::{
    dev::{forward_ready, Service, ServiceRequest, ServiceResponse, Transform},
    Error, HttpMessage,
};
use futures_util::future::LocalBoxFuture;
use std::{
    future::{ready, Ready},
    rc::Rc,
};

use crate::api::auth::{AuthConfig, AuthInfo, Claims, Rank};

/// Required rank for accessing an endpoint
#[derive(Clone)]
pub enum RequiredRank {
    Officer,
    SeniorNCO,
    NCO,
    Any,
}

/// Authorization requirements for an endpoint
#[derive(Clone)]
pub struct AuthRequirements {
    pub required_rank: RequiredRank,
    pub supply_chain_only: bool,
    pub same_unit_only: bool,
}

impl Default for AuthRequirements {
    fn default() -> Self {
        Self {
            required_rank: RequiredRank::Any,
            supply_chain_only: false,
            same_unit_only: false,
        }
    }
}

/// Authorization middleware factory
pub struct Authorization {
    config: Rc<AuthConfig>,
    requirements: AuthRequirements,
}

impl Authorization {
    pub fn new(config: AuthConfig, requirements: AuthRequirements) -> Self {
        Self {
            config: Rc::new(config),
            requirements,
        }
    }

    /// Creates middleware requiring officer rank
    pub fn officer(config: AuthConfig) -> Self {
        Self::new(config, AuthRequirements {
            required_rank: RequiredRank::Officer,
            ..Default::default()
        })
    }

    /// Creates middleware requiring senior NCO rank
    pub fn senior_nco(config: AuthConfig) -> Self {
        Self::new(config, AuthRequirements {
            required_rank: RequiredRank::SeniorNCO,
            ..Default::default()
        })
    }

    /// Creates middleware requiring NCO rank
    pub fn nco(config: AuthConfig) -> Self {
        Self::new(config, AuthRequirements {
            required_rank: RequiredRank::NCO,
            ..Default::default()
        })
    }

    /// Creates middleware requiring supply chain role
    pub fn supply_chain(config: AuthConfig) -> Self {
        Self::new(config, AuthRequirements {
            supply_chain_only: true,
            ..Default::default()
        })
    }

    /// Creates middleware requiring same unit access
    pub fn same_unit(config: AuthConfig) -> Self {
        Self::new(config, AuthRequirements {
            same_unit_only: true,
            ..Default::default()
        })
    }
}

impl<S, B> Transform<S, ServiceRequest> for Authorization
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Transform = AuthorizationMiddleware<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(AuthorizationMiddleware {
            service,
            config: self.config.clone(),
            requirements: self.requirements.clone(),
        }))
    }
}

/// Authorization middleware
pub struct AuthorizationMiddleware<S> {
    service: S,
    config: Rc<AuthConfig>,
    requirements: AuthRequirements,
}

impl<S, B> Service<ServiceRequest> for AuthorizationMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let config = self.config.clone();
        let requirements = self.requirements.clone();
        let service = self.service.clone();

        Box::pin(async move {
            // Extract token from Authorization header
            let token = req
                .headers()
                .get("Authorization")
                .and_then(|h| h.to_str().ok())
                .and_then(|h| h.strip_prefix("Bearer "))
                .ok_or_else(|| {
                    actix_web::error::ErrorUnauthorized("Missing or invalid authorization token")
                })?;

            // Validate token and extract claims
            let claims = config.validate_token(token).map_err(|_| {
                actix_web::error::ErrorUnauthorized("Invalid authorization token")
            })?;

            // Create auth info
            let auth_info = AuthInfo {
                user_id: claims.sub,
                name: claims.name,
                rank: claims.rank,
                unit: claims.unit,
            };

            // Check rank requirements
            match requirements.required_rank {
                RequiredRank::Officer if !auth_info.is_officer() => {
                    return Err(actix_web::error::ErrorForbidden(
                        "Officer rank required",
                    ));
                }
                RequiredRank::SeniorNCO if !auth_info.is_senior_nco() && !auth_info.is_officer() => {
                    return Err(actix_web::error::ErrorForbidden(
                        "Senior NCO rank or higher required",
                    ));
                }
                RequiredRank::NCO if !auth_info.is_nco() && !auth_info.is_officer() => {
                    return Err(actix_web::error::ErrorForbidden("NCO rank or higher required"));
                }
                _ => {}
            }

            // Check supply chain requirement
            if requirements.supply_chain_only && !auth_info.is_supply_chain() {
                return Err(actix_web::error::ErrorForbidden(
                    "Supply chain role required",
                ));
            }

            // Check unit access
            if requirements.same_unit_only {
                // Extract target unit from request (implementation depends on your API structure)
                if let Some(target_unit) = req.match_info().get("unit") {
                    if !auth_info.has_command_over(target_unit) {
                        return Err(actix_web::error::ErrorForbidden(
                            "No authority over target unit",
                        ));
                    }
                }
            }

            // Add auth info to request extensions
            req.extensions_mut().insert(auth_info);

            // Forward request to next handler
            service.call(req).await
        })
    }
}

/// Helper functions for working with auth info in handlers
pub trait AuthInfoExtractor {
    fn auth_info(&self) -> Option<&AuthInfo>;
}

impl AuthInfoExtractor for ServiceRequest {
    fn auth_info(&self) -> Option<&AuthInfo> {
        self.extensions().get::<AuthInfo>()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::test;

    #[actix_web::test]
    async fn test_officer_authorization() {
        let config = AuthConfig::new(
            "test_secret".to_string(),
            chrono::Duration::hours(1),
        );

        // Create test claims for an officer
        let claims = Claims {
            sub: Uuid::new_v4(),
            name: "Test Officer".to_string(),
            rank: Rank::Captain,
            unit: crate::api::auth::UnitInfo {
                unit_id: "1-1-IN".to_string(),
                parent_unit: Some("1-IN".to_string()),
                position: "Company Commander".to_string(),
                duty_position: None,
            },
            exp: (chrono::Utc::now() + chrono::Duration::hours(1)).timestamp(),
            iat: chrono::Utc::now().timestamp(),
        };

        // Create token
        let token = config.create_token(claims).unwrap();

        // Create test request
        let req = test::TestRequest::default()
            .insert_header(("Authorization", format!("Bearer {}", token)))
            .to_srv_request();

        // Test officer middleware
        let auth = Authorization::officer(config.clone());
        let resp = auth
            .new_transform(test::ok_service())
            .await
            .unwrap()
            .call(req)
            .await;

        assert!(resp.is_ok());
    }

    #[actix_web::test]
    async fn test_nco_authorization() {
        let config = AuthConfig::new(
            "test_secret".to_string(),
            chrono::Duration::hours(1),
        );

        // Create test claims for an NCO
        let claims = Claims {
            sub: Uuid::new_v4(),
            name: "Test NCO".to_string(),
            rank: Rank::SergeantFirstClass,
            unit: crate::api::auth::UnitInfo {
                unit_id: "1-1-IN".to_string(),
                parent_unit: None,
                position: "Platoon Sergeant".to_string(),
                duty_position: Some("Supply Sergeant".to_string()),
            },
            exp: (chrono::Utc::now() + chrono::Duration::hours(1)).timestamp(),
            iat: chrono::Utc::now().timestamp(),
        };

        // Create token
        let token = config.create_token(claims).unwrap();

        // Create test request
        let req = test::TestRequest::default()
            .insert_header(("Authorization", format!("Bearer {}", token)))
            .to_srv_request();

        // Test NCO middleware
        let auth = Authorization::nco(config.clone());
        let resp = auth
            .new_transform(test::ok_service())
            .await
            .unwrap()
            .call(req)
            .await;

        assert!(resp.is_ok());
    }
}
