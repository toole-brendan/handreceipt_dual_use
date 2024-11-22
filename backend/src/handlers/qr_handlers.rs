// backend/src/handlers/qr_handlers.rs

use actix_web::{web, HttpResponse, Error};
use uuid::Uuid;
use serde_json::json;

use crate::core::{AppState, SecurityContext};
use crate::models::{QRFormat, QRResponse, VerifyQRRequest};

pub async fn generate_asset_qr(
    state: web::Data<AppState>,
    asset_id: web::Path<Uuid>,
    format: web::Query<QRFormat>,
    _security_context: web::ReqData<SecurityContext>,
) -> Result<HttpResponse, Error> {
    let asset_id_value = asset_id.into_inner();
    
    let asset = match state
        .database
        .get_asset(asset_id_value, &_security_context)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e.to_string()))? {
            Some(asset) => asset,
            None => return Ok(HttpResponse::NotFound().json(json!({
                "error": "Not found",
                "message": "Asset not found"
            }))),
    };

    let response = match format.format.as_deref() {
        Some("svg") => {
            let svg = state
                .qr_service
                .generate_svg(asset_id_value)
                .map_err(|e| actix_web::error::ErrorInternalServerError(e.to_string()))?;
            
            HttpResponse::Ok()
                .content_type("image/svg+xml")
                .body(svg)
        }
        _ => {
            let qr_code = state
                .qr_service
                .generate_asset_qr(asset_id_value)
                .map_err(|e| actix_web::error::ErrorInternalServerError(e.to_string()))?;
            
            HttpResponse::Ok().json(QRResponse {
                qr_code,
                asset_id: asset.id.to_string(),
                last_verified: asset.last_verified.map(|dt| dt.to_rfc3339()),
                verification_count: Some(asset.verification_count),
            })
        }
    };

    Ok(response)
}

pub async fn verify_qr_code(
    state: web::Data<AppState>,
    request: web::Json<VerifyQRRequest>,
    _security_context: web::ReqData<SecurityContext>,
) -> Result<HttpResponse, Error> {
    let asset_id = state
        .qr_service
        .verify_qr_code(&request.qr_data)
        .map_err(|e| actix_web::error::ErrorInternalServerError(e.to_string()))?;

    Ok(HttpResponse::Ok().json(json!({
        "asset_id": asset_id
    })))
} 