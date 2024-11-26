use actix_web::{web, HttpResponse};
use serde_json::json;
use crate::{
    domain::property::{
        entity::{Property, PropertyCategory, PropertyStatus},
        service::PropertyService,
    },
    types::security::SecurityContext,
    error::api::ApiError,
};
use std::sync::Arc;

pub async fn create_property(
    property_service: web::Data<Arc<dyn PropertyService>>,
    context: web::ReqData<SecurityContext>,
    req: web::Json<CreatePropertyRequest>,
) -> Result<HttpResponse, ApiError> {
    let property = Property::new(
        req.name.clone(),
        req.description.clone(),
        req.category.clone(),
        req.current_holder_id,
        req.location.clone(),
    );

    let created = property_service
        .create_property(&property, &context)
        .await
        .map_err(|e| ApiError::InternalError(e.to_string()))?;

    Ok(HttpResponse::Created().json(json!({
        "id": created.id,
        "name": created.name,
        "description": created.description,
        "category": created.category,
        "status": created.status,
        "location": created.location,
        "current_holder_id": created.current_holder_id,
        "is_sensitive": created.is_sensitive,
        "quantity": created.quantity,
        "notes": created.notes,
        "serial_number": created.serial_number,
        "nsn": created.nsn,
        "hand_receipt_number": created.hand_receipt_number,
        "requires_approval": created.requires_approval,
        "created_at": created.created_at,
        "updated_at": created.updated_at
    })))
}

pub async fn get_property(
    property_service: web::Data<Arc<dyn PropertyService>>,
    context: web::ReqData<SecurityContext>,
    id: web::Path<i32>,
) -> Result<HttpResponse, ApiError> {
    let property = property_service
        .get_property(id.into_inner(), &context)
        .await
        .map_err(|e| ApiError::InternalError(e.to_string()))?
        .ok_or_else(|| ApiError::NotFound("Property not found".to_string()))?;

    Ok(HttpResponse::Ok().json(json!({
        "id": property.id,
        "name": property.name,
        "description": property.description,
        "category": property.category,
        "status": property.status,
        "location": property.location,
        "current_holder_id": property.current_holder_id,
        "is_sensitive": property.is_sensitive,
        "quantity": property.quantity,
        "notes": property.notes,
        "serial_number": property.serial_number,
        "nsn": property.nsn,
        "hand_receipt_number": property.hand_receipt_number,
        "requires_approval": property.requires_approval,
        "created_at": property.created_at,
        "updated_at": property.updated_at
    })))
}

pub async fn update_property(
    property_service: web::Data<Arc<dyn PropertyService>>,
    context: web::ReqData<SecurityContext>,
    id: web::Path<i32>,
    req: web::Json<UpdatePropertyRequest>,
) -> Result<HttpResponse, ApiError> {
    let mut property = property_service
        .get_property(id.into_inner(), &context)
        .await
        .map_err(|e| ApiError::InternalError(e.to_string()))?
        .ok_or_else(|| ApiError::NotFound("Property not found".to_string()))?;

    if let Some(ref name) = req.name {
        property.name = name.clone();
    }
    if let Some(ref description) = req.description {
        property.description = description.clone();
    }
    if let Some(category) = req.category {
        property.category = category;
    }
    if let Some(ref location) = req.location {
        property.location = location.clone();
    }
    if let Some(is_sensitive) = req.is_sensitive {
        property.is_sensitive = is_sensitive;
    }
    if let Some(quantity) = req.quantity {
        property.quantity = quantity;
    }
    if let Some(ref notes) = req.notes {
        property.notes = Some(notes.clone());
    }
    if let Some(ref serial_number) = req.serial_number {
        property.serial_number = Some(serial_number.clone());
    }
    if let Some(ref nsn) = req.nsn {
        property.nsn = Some(nsn.clone());
    }
    if let Some(ref hand_receipt_number) = req.hand_receipt_number {
        property.hand_receipt_number = Some(hand_receipt_number.clone());
    }
    if let Some(requires_approval) = req.requires_approval {
        property.requires_approval = requires_approval;
    }

    let updated = property_service
        .update_property(&property, &context)
        .await
        .map_err(|e| ApiError::InternalError(e.to_string()))?;

    Ok(HttpResponse::Ok().json(json!({
        "id": updated.id,
        "name": updated.name,
        "description": updated.description,
        "category": updated.category,
        "status": updated.status,
        "location": updated.location,
        "current_holder_id": updated.current_holder_id,
        "is_sensitive": updated.is_sensitive,
        "quantity": updated.quantity,
        "notes": updated.notes,
        "serial_number": updated.serial_number,
        "nsn": updated.nsn,
        "hand_receipt_number": updated.hand_receipt_number,
        "requires_approval": updated.requires_approval,
        "created_at": updated.created_at,
        "updated_at": updated.updated_at
    })))
}

pub async fn generate_qr(
    property_service: web::Data<Arc<dyn PropertyService>>,
    context: web::ReqData<SecurityContext>,
    id: web::Path<i32>,
) -> Result<HttpResponse, ApiError> {
    let qr_data = property_service.generate_qr(*id, &context)
        .await
        .map_err(|e| ApiError::InternalError(e.to_string()))?;

    Ok(HttpResponse::Ok().json(json!({
        "qr_data": qr_data,
    })))
}

pub async fn get_sync_status(
    property_service: web::Data<Arc<dyn PropertyService>>,
    context: web::ReqData<SecurityContext>,
    id: web::Path<i32>,
) -> Result<HttpResponse, ApiError> {
    let status = property_service.get_sync_status(*id, &context)
        .await
        .map_err(|e| ApiError::InternalError(e.to_string()))?;

    Ok(HttpResponse::Ok().json(json!({
        "is_synced": status.is_synced,
        "last_sync": status.last_sync,
        "blockchain_hash": status.blockchain_hash,
    })))
}

#[derive(Debug, Clone, serde::Deserialize)]
pub struct CreatePropertyRequest {
    pub name: String,
    pub description: String,
    pub category: PropertyCategory,
    pub current_holder_id: i32,
    pub location: crate::domain::models::location::Location,
    pub is_sensitive: Option<bool>,
    pub quantity: Option<i32>,
    pub notes: Option<String>,
    pub serial_number: Option<String>,
    pub nsn: Option<String>,
    pub hand_receipt_number: Option<String>,
    pub requires_approval: Option<bool>,
}

#[derive(Debug, Clone, serde::Deserialize)]
pub struct UpdatePropertyRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub category: Option<PropertyCategory>,
    pub location: Option<crate::domain::models::location::Location>,
    pub is_sensitive: Option<bool>,
    pub quantity: Option<i32>,
    pub notes: Option<String>,
    pub serial_number: Option<String>,
    pub nsn: Option<String>,
    pub hand_receipt_number: Option<String>,
    pub requires_approval: Option<bool>,
}

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/properties")
            .route("", web::post().to(create_property))
            .route("/{id}", web::get().to(get_property))
            .route("/{id}", web::put().to(update_property))
            .route("/{id}/qr", web::get().to(generate_qr))
            .route("/{id}/sync", web::get().to(get_sync_status))
    );
}
