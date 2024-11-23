use actix_web::HttpResponse;
use crate::api::types::ApiResponse;

pub async fn health_check() -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::success("Service is healthy"))
}
