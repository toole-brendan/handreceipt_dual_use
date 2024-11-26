use actix_web::{web, HttpResponse};
use serde_json::json;
use crate::{
    domain::{
        transfer::{
            entity::{Transfer, TransferStatus},
            service::TransferService,
        },
        models::location::Location,
    },
    types::security::SecurityContext,
    error::api::ApiError,
};
use std::sync::Arc;
use chrono::{DateTime, Utc};

pub async fn create_transfer(
    transfer_service: web::Data<Arc<dyn TransferService>>,
    context: web::ReqData<SecurityContext>,
    req: web::Json<CreateTransferRequest>,
) -> Result<HttpResponse, ApiError> {
    let transfer = Transfer::new(
        req.property_id,
        req.from_holder_id,
        req.to_holder_id,
        req.location.clone(),
        req.notes.clone(),
    );

    let context = &*context;
    let created = transfer_service.create_transfer(transfer, context).await
        .map_err(|e| ApiError::InternalError(e.to_string()))?;

    Ok(HttpResponse::Created().json(json!({
        "id": created.id,
        "property_id": created.property_id,
        "from_holder_id": created.from_holder_id,
        "to_holder_id": created.to_holder_id,
        "status": created.status.to_string(),
        "location": created.location,
        "created_at": created.created_at.to_rfc3339(),
        "updated_at": created.updated_at.to_rfc3339(),
    })))
}

pub async fn get_transfer(
    transfer_service: web::Data<Arc<dyn TransferService>>,
    context: web::ReqData<SecurityContext>,
    id: web::Path<i32>,
) -> Result<HttpResponse, ApiError> {
    let context = &*context;
    let transfer = transfer_service.get_transfer(*id, context).await
        .map_err(|e| ApiError::InternalError(e.to_string()))?;

    match transfer {
        Some(t) => Ok(HttpResponse::Ok().json(json!({
            "id": t.id,
            "property_id": t.property_id,
            "from_holder_id": t.from_holder_id,
            "to_holder_id": t.to_holder_id,
            "status": t.status.to_string(),
            "location": t.location,
            "created_at": t.created_at.to_rfc3339(),
            "updated_at": t.updated_at.to_rfc3339(),
            "approved_at": t.approved_at,
            "approved_by_id": t.approved_by_id,
            "notes": t.notes,
        }))),
        None => Ok(HttpResponse::NotFound().finish()),
    }
}

pub async fn approve_transfer(
    transfer_service: web::Data<Arc<dyn TransferService>>,
    context: web::ReqData<SecurityContext>,
    id: web::Path<i32>,
) -> Result<HttpResponse, ApiError> {
    let context = &*context;
    let transfer = transfer_service.approve_transfer(*id, context).await
        .map_err(|e| ApiError::InternalError(e.to_string()))?;

    Ok(HttpResponse::Ok().json(json!({
        "id": transfer.id,
        "status": transfer.status.to_string(),
        "approved_at": transfer.approved_at,
        "approved_by_id": transfer.approved_by_id,
    })))
}

pub async fn scan_qr_transfer(
    transfer_service: web::Data<Arc<dyn TransferService>>,
    context: web::ReqData<SecurityContext>,
    req: web::Json<ScanQRRequest>,
) -> Result<HttpResponse, ApiError> {
    let transfer = transfer_service.scan_qr_transfer(&req.qr_data, &req.location, &context)
        .await
        .map_err(|e| ApiError::InternalError(e.to_string()))?;

    Ok(HttpResponse::Ok().json(transfer))
}

pub async fn get_pending_transfers(
    transfer_service: web::Data<Arc<dyn TransferService>>,
    context: web::ReqData<SecurityContext>,
) -> Result<HttpResponse, ApiError> {
    let transfers = transfer_service.get_pending_transfers(&context)
        .await
        .map_err(|e| ApiError::InternalError(e.to_string()))?;

    Ok(HttpResponse::Ok().json(transfers))
}

pub async fn get_transfer_status(
    transfer_service: web::Data<Arc<dyn TransferService>>,
    context: web::ReqData<SecurityContext>,
    id: web::Path<i32>,
) -> Result<HttpResponse, ApiError> {
    let transfer = transfer_service.get_transfer(*id, &context)
        .await
        .map_err(|e| ApiError::InternalError(e.to_string()))?;

    match transfer {
        Some(t) => Ok(HttpResponse::Ok().json(json!({
            "id": t.id,
            "status": t.status.to_string(),
            "approved_at": t.approved_at,
            "approved_by_id": t.approved_by_id,
        }))),
        None => Ok(HttpResponse::NotFound().finish()),
    }
}

pub async fn get_property_transfers(
    transfer_service: web::Data<Arc<dyn TransferService>>,
    context: web::ReqData<SecurityContext>,
    property_id: web::Path<i32>,
) -> Result<HttpResponse, ApiError> {
    let transfers = transfer_service.get_property_transfers(*property_id, &context)
        .await
        .map_err(|e| ApiError::InternalError(e.to_string()))?;

    Ok(HttpResponse::Ok().json(transfers))
}

#[derive(Debug, serde::Deserialize)]
pub struct CreateTransferRequest {
    pub property_id: i32,
    pub from_holder_id: i32,
    pub to_holder_id: i32,
    pub location: Location,
    pub notes: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
pub struct ScanQRRequest {
    pub qr_data: String,
    pub location: Location,
}

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/transfers")
            .route("", web::post().to(create_transfer))
            .route("/{id}", web::get().to(get_transfer))
            .route("/{id}/approve", web::post().to(approve_transfer))
            .route("/scan-qr", web::post().to(scan_qr_transfer))
            .route("/pending", web::get().to(get_pending_transfers))
            .route("/{id}/status", web::get().to(get_transfer_status))
            .route("/property/{property_id}", web::get().to(get_property_transfers))
    );
}
