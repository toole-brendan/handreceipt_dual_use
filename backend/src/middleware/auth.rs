use actix_web::{
    dev::{forward_ready, Service, ServiceRequest, ServiceResponse, Transform},
    Error, HttpMessage,
};
use futures::future::{ready, Ready};
use std::future::Future;
use std::pin::Pin;
use uuid::Uuid;
use std::collections::HashMap;

use crate::types::{
    security::{SecurityContext, SecurityClassification},
    permissions::{Permission, ResourceType, Action},
};

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
        // Create a test security context
        let security_context = create_security_context("test-token").unwrap();

        // Insert security context into request extensions
        req.extensions_mut().insert(security_context);

        let fut = self.service.call(req);
        Box::pin(async move {
            let res = fut.await?;
            Ok(res)
        })
    }
}

fn create_security_context(auth_str: &str) -> Result<SecurityContext, Box<dyn std::error::Error>> {
    Ok(SecurityContext {
        classification: SecurityClassification::Unclassified,
        user_id: Uuid::new_v4(),
        token: auth_str.to_string(),
        permissions: vec![],
        metadata: HashMap::new(),
    })
} 