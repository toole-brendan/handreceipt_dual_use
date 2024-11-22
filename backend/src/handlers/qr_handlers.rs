// backend/src/handlers/qr_handlers.rs

use actix_web::{web, HttpResponse, Error};
use uuid::Uuid;
use serde::{Serialize, Deserialize};
use serde_json::json;

use crate::types::{
    app::AppState,
    security::SecurityContext,
    audit::{AuditEvent, AuditEventType, AuditStatus, AuditContext, AuditSeverity},
};

#[derive(Debug, Serialize, Deserialize)]
pub struct QRFormat {
    pub format: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct QRResponse {
    pub qr_code: String,
    pub asset_id: String,
    pub last_verified: Option<String>,
    pub verification_count: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct VerifyQRRequest {
    pub qr_data: String,
}

pub async fn generate_asset_qr(
    state: web::Data<AppState>,
    asset_id: web::Path<Uuid>,
    format: web::Query<QRFormat>,
    security_context: web::ReqData<SecurityContext>,
) -> Result<HttpResponse, Error> {
    // Get asset
    let asset = match state.db
        .get_asset(asset_id.into_inner(), &security_context)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))? {
            Some(asset) => asset,
            None => return Ok(HttpResponse::NotFound().json(json!({
                "error": "Not found",
                "message": "Asset not found"
            }))),
    };

    // Verify asset using asset verification service
    let verification_result = state.asset_verification
        .verify_asset(&asset.id.to_string())
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    // Create audit event
    let event = AuditEvent {
        id: Uuid::new_v4(),
        timestamp: chrono::Utc::now(),
        event_type: AuditEventType::AssetCreated,
        status: AuditStatus::Success,
        details: json!({
            "asset_id": asset.id,
            "qr_format": format.format,
            "verification_result": format!("{:?}", verification_result),
        }),
        context: AuditContext {
            user_id: Some(security_context.user_id.to_string()),
            resource_id: Some(asset.id.to_string()),
            action: "GENERATE_QR".to_string(),
            severity: AuditSeverity::Low,
            metadata: None,
        },
    };

    // Log the event
    state.audit_logger.log_event(event, &security_context)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    // Return QR code
    Ok(HttpResponse::Ok().json(QRResponse {
        qr_code: format!("{:?}", verification_result),
        asset_id: asset.id.to_string(),
        last_verified: asset.last_verified.map(|dt| dt.to_rfc3339()),
        verification_count: Some(asset.verification_count),
    }))
}

pub async fn verify_qr_code(
    state: web::Data<AppState>,
    request: web::Json<VerifyQRRequest>,
    security_context: web::ReqData<SecurityContext>,
) -> Result<HttpResponse, Error> {
    // Verify QR code using asset verification service
    let verification_result = state.asset_verification
        .verify_asset(&request.qr_data)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    // Create audit event
    let event = AuditEvent {
        id: Uuid::new_v4(),
        timestamp: chrono::Utc::now(),
        event_type: AuditEventType::AssetCreated,
        status: AuditStatus::Success,
        details: json!({
            "qr_data": request.qr_data,
            "verification_result": format!("{:?}", verification_result),
        }),
        context: AuditContext {
            user_id: Some(security_context.user_id.to_string()),
            resource_id: None,
            action: "VERIFY_QR".to_string(),
            severity: AuditSeverity::Low,
            metadata: None,
        },
    };

    // Log the event
    state.audit_logger.log_event(event, &security_context)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    Ok(HttpResponse::Ok().json(json!({
        "verification_result": format!("{:?}", verification_result),
    })))
} 