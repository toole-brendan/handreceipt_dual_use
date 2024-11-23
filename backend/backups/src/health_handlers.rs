use actix_web::HttpResponse;
use crate::api::ApiResponse;

pub async fn health_check() -> HttpResponse {
    log::info!("Health check endpoint called");
    HttpResponse::Ok().json(ApiResponse::success("Service is healthy"))
} 