use actix_web::{
    dev::{forward_ready, Service, ServiceRequest, ServiceResponse, Transform},
    Error, HttpMessage, HttpResponse,
};
use futures::future::{ready, Ready};
use std::future::Future;
use std::pin::Pin;
use uuid::Uuid;
use std::collections::HashMap;
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use serde::{Deserialize, Serialize};

use crate::types::{
    security::{SecurityContext, SecurityClassification},
    permissions::{Permission, ResourceType, Action},
};

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,          // User ID
    exp: usize,          // Expiration time
    role: String,        // User role (Officer, NCO, Soldier)
    unit: String,        // Military unit
    iat: usize,         // Issued at
}

pub struct Authentication;

impl<S, B> Transform<S, ServiceRequest> for Authentication
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type InitError = ();
    type Transform = AuthenticationMiddleware<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(AuthenticationMiddleware { service }))
    }
}

pub struct AuthenticationMiddleware<S> {
    service: S,
}

impl<S, B> Service<ServiceRequest> for AuthenticationMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        // Extract JWT token from Authorization header
        let auth_header = match req.headers().get("Authorization") {
            Some(header) => header.to_str().unwrap_or("").to_string(),
            None => {
                return Box::pin(async move {
                    Ok(ServiceResponse::new(
                        req.into_parts().0,
                        HttpResponse::Unauthorized().finish(),
                    ))
                });
            }
        };

        // Validate token format
        let token = match auth_header.strip_prefix("Bearer ") {
            Some(token) => token.to_string(),
            None => {
                return Box::pin(async move {
                    Ok(ServiceResponse::new(
                        req.into_parts().0,
                        HttpResponse::Unauthorized().finish(),
                    ))
                });
            }
        };

        // JWT validation
        let secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "default_secret".to_string());
        let validation = Validation::new(Algorithm::HS256);
        
        let token_data = match decode::<Claims>(
            &token,
            &DecodingKey::from_secret(secret.as_bytes()),
            &validation,
        ) {
            Ok(token) => token,
            Err(_) => {
                return Box::pin(async move {
                    Ok(ServiceResponse::new(
                        req.into_parts().0,
                        HttpResponse::Unauthorized().finish(),
                    ))
                });
            }
        };

        // Create security context from validated claims
        let claims = token_data.claims;
        let mut permissions = Vec::new();

        // Assign permissions based on role
        match claims.role.as_str() {
            "Officer" => {
                permissions.push(Permission {
                    resource_type: ResourceType::Property,
                    action: Action::ViewAll,
                });
                permissions.push(Permission {
                    resource_type: ResourceType::Transfer,
                    action: Action::Approve,
                });
            },
            "NCO" => {
                permissions.push(Permission {
                    resource_type: ResourceType::Property,
                    action: Action::ViewUnit,
                });
                permissions.push(Permission {
                    resource_type: ResourceType::Transfer,
                    action: Action::Initiate,
                });
            },
            "Soldier" => {
                permissions.push(Permission {
                    resource_type: ResourceType::Property,
                    action: Action::ViewOwn,
                });
                permissions.push(Permission {
                    resource_type: ResourceType::Transfer,
                    action: Action::Initiate,
                });
            },
            _ => {}
        };

        let security_context = SecurityContext {
            classification: SecurityClassification::Unclassified,
            user_id: Uuid::parse_str(&claims.sub).unwrap_or_else(|_| Uuid::new_v4()),
            token: token.clone(),
            permissions,
            metadata: {
                let mut map = HashMap::new();
                map.insert("role".to_string(), claims.role);
                map.insert("unit".to_string(), claims.unit);
                map
            },
        };

        // Insert security context into request extensions
        req.extensions_mut().insert(security_context);

        let fut = self.service.call(req);
        Box::pin(async move {
            let res = fut.await?;
            Ok(res)
        })
    }
}
