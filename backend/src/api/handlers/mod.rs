pub mod health;

use actix_web::{Error, HttpResponse};
use crate::api::types::ApiResponse;

pub type HandlerResult = Result<HttpResponse, Error>;

pub fn map_db_error(e: impl std::error::Error) -> Error {
    actix_web::error::ErrorInternalServerError(e.to_string())
}

pub fn map_validation_error(e: impl std::fmt::Display) -> Error {
    actix_web::error::ErrorBadRequest(e.to_string())
}

pub fn ok_response<T: serde::Serialize>(data: T) -> HandlerResult {
    Ok(HttpResponse::Ok().json(ApiResponse::success(data)))
}

pub fn created_response<T: serde::Serialize>(data: T) -> HandlerResult {
    Ok(HttpResponse::Created().json(ApiResponse::success(data)))
}

pub fn no_content_response() -> HandlerResult {
    Ok(HttpResponse::NoContent().finish())
}
