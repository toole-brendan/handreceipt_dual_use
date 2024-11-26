pub mod property;
pub mod transfer;
pub mod user;

// Re-export common types
pub use property::*;
pub use transfer::*;
pub use user::*;

use serde::{Deserialize, Serialize};
use actix_web::{web, Error, HttpResponse};
use std::sync::Arc;

use crate::{
    types::{
        security::SecurityContext,
        permissions::Permission,
    },
    api::types::ApiResponse,
};

pub type HandlerResult = Result<HttpResponse, Error>;

pub trait Handler<T, R>: Send + Sync + 'static {
    async fn handle(&self, req: T) -> Result<R, Error>;
}

impl<F, T, R, Fut> Handler<T, R> for F
where
    F: Send + Sync + 'static + Fn(T) -> Fut,
    Fut: std::future::Future<Output = Result<R, Error>> + Send + 'static,
{
    async fn handle(&self, req: T) -> Result<R, Error> {
        (self)(req).await
    }
}

pub fn check_permission(
    security_context: &SecurityContext,
    permission: Permission,
) -> Result<(), Error> {
    if !security_context.has_permission(&permission) {
        return Err(actix_web::error::ErrorForbidden("Insufficient permissions"));
    }
    Ok(())
}

pub fn ok_response<T: Serialize>(data: T) -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::<T>::success(data))
}

pub fn created_response<T: Serialize>(data: T) -> HttpResponse {
    HttpResponse::Created().json(ApiResponse::<T>::success(data))
}

pub fn no_content_response() -> HttpResponse {
    HttpResponse::NoContent().finish()
}

pub fn not_found_response(message: &str) -> HttpResponse {
    HttpResponse::NotFound().json(ApiResponse::<()>::error(message.to_string()))
}

pub fn forbidden_response(message: &str) -> HttpResponse {
    HttpResponse::Forbidden().json(ApiResponse::<()>::error(message.to_string()))
}

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    property::configure_routes(cfg);
    transfer::configure_routes(cfg);
    user::configure_routes(cfg);
}
