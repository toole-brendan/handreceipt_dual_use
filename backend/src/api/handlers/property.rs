use actix_web::{web, HttpResponse, Error};
use serde::{Serialize, Deserialize};
use uuid::Uuid;
use std::sync::Arc;

use crate::{
    domain::{
        property::{
            entity::{Property, PropertyCategory},
            repository::PropertySearchCriteria,
        },
        models::{
            qr::{QRCodeService, QRFormat, QRData},
        },
    },
    types::{
        app::PropertyService,
        security::SecurityContext,
    },
};

/// Request to create new property
#[derive(Debug, Deserialize)]
pub struct CreatePropertyRequest {
    pub name: String,
    pub description: String,
    pub category: PropertyCategory,
    pub nsn: Option<String>,
    pub serial_number: Option<String>,
    pub model_number: Option<String>,
    pub is_sensitive: bool,
    pub quantity: i32,
    pub unit_of_issue: String,
    pub value: Option<f64>,
    pub location: Option<String>,
}

/// Property response with QR code
#[derive(Debug, Serialize)]
pub struct PropertyResponse {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub nsn: Option<String>,
    pub serial_number: Option<String>,
    pub is_sensitive: bool,
    pub quantity: i32,
    pub custodian: Option<String>,
    pub qr_code: Option<Vec<u8>>,
    pub status: String,
}

/// Creates a new property item
pub async fn create_property(
    property_service: web::Data<Arc<dyn PropertyService>>,
    qr_service: web::Data<Arc<dyn QRCodeService>>,
    user_id: web::ReqData<String>,
    request: web::Json<CreatePropertyRequest>,
) -> Result<HttpResponse, Error> {
    let context = SecurityContext::new(Uuid::parse_str(&user_id.into_inner())
        .map_err(actix_web::error::ErrorBadRequest)?);

    // Create property using builder pattern
    let mut property = Property::new(
        request.name.clone(),
        request.description.clone(),
        request.category.clone(),
        request.is_sensitive,
        request.quantity,
        request.unit_of_issue.clone(),
    )
    .map_err(actix_web::error::ErrorBadRequest)?;

    // Set optional fields using builder methods
    if let Some(nsn) = &request.nsn {
        property = property.with_nsn(nsn.clone());
    }
    if let Some(serial) = &request.serial_number {
        property = property.with_serial_number(Some(serial.clone()));
    }
    if let Some(model) = &request.model_number {
        property = property.with_model_number(model.clone());
    }

    let property = property_service
        .create_property(property, &context)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    // Generate QR code
    let qr_data = QRData {
        id: Uuid::new_v4(),
        property_id: property.id(),
        metadata: serde_json::json!({}),
        timestamp: chrono::Utc::now(),
    };

    let qr_code = qr_service
        .generate_qr(&qr_data, QRFormat::PNG, &context)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(PropertyResponse {
        id: property.id(),
        name: property.name().to_string(),
        description: property.description().to_string(),
        nsn: property.nsn().cloned(),
        serial_number: property.serial_number().cloned(),
        is_sensitive: property.is_sensitive(),
        quantity: property.quantity(),
        custodian: property.custodian().cloned(),
        qr_code: Some(qr_code.data),
        status: format!("{:?}", property.status()),
    }))
}

/// Gets property by ID
pub async fn get_property(
    property_service: web::Data<Arc<dyn PropertyService>>,
    qr_service: web::Data<Arc<dyn QRCodeService>>,
    id: web::Path<Uuid>,
    user_id: web::ReqData<String>,
) -> Result<HttpResponse, Error> {
    let context = SecurityContext::new(Uuid::parse_str(&user_id.into_inner())
        .map_err(actix_web::error::ErrorBadRequest)?);
    let property = property_service
        .get_property(id.into_inner(), &context)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?
        .ok_or_else(|| actix_web::error::ErrorNotFound("Property not found"))?;

    let qr_data = QRData {
        id: Uuid::new_v4(),
        property_id: property.id(),
        metadata: serde_json::json!({}),
        timestamp: chrono::Utc::now(),
    };

    let qr_code = qr_service
        .generate_qr(&qr_data, QRFormat::PNG, &context)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(PropertyResponse {
        id: property.id(),
        name: property.name().to_string(),
        description: property.description().to_string(),
        nsn: property.nsn().cloned(),
        serial_number: property.serial_number().cloned(),
        is_sensitive: property.is_sensitive(),
        quantity: property.quantity(),
        custodian: property.custodian().cloned(),
        qr_code: Some(qr_code.data),
        status: format!("{:?}", property.status()),
    }))
}

/// Updates an existing property
pub async fn update_property(
    property_service: web::Data<Arc<dyn PropertyService>>,
    id: web::Path<Uuid>,
    request: web::Json<CreatePropertyRequest>,
    user_id: web::ReqData<String>,
) -> Result<HttpResponse, Error> {
    let context = SecurityContext::new(Uuid::parse_str(&user_id.into_inner())
        .map_err(actix_web::error::ErrorBadRequest)?);

    let mut property = property_service
        .get_property(id.into_inner(), &context)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?
        .ok_or_else(|| actix_web::error::ErrorNotFound("Property not found"))?;

    // Update property using builder pattern
    let mut updated = Property::new(
        request.name.clone(),
        request.description.clone(),
        request.category.clone(),
        request.is_sensitive,
        request.quantity,
        request.unit_of_issue.clone(),
    )
    .map_err(actix_web::error::ErrorBadRequest)?;

    // Set optional fields using builder methods
    if let Some(nsn) = &request.nsn {
        updated = updated.with_nsn(nsn.clone());
    }
    if let Some(serial) = &request.serial_number {
        updated = updated.with_serial_number(Some(serial.clone()));
    }
    if let Some(model) = &request.model_number {
        updated = updated.with_model_number(model.clone());
    }

    property_service
        .update_property(&updated, &context)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(PropertyResponse {
        id: updated.id(),
        name: updated.name().to_string(),
        description: updated.description().to_string(),
        nsn: updated.nsn().cloned(),
        serial_number: updated.serial_number().cloned(),
        is_sensitive: updated.is_sensitive(),
        quantity: updated.quantity(),
        custodian: updated.custodian().cloned(),
        qr_code: None,
        status: format!("{:?}", updated.status()),
    }))
}

/// Gets property for current user
pub async fn get_my_property(
    property_service: web::Data<Arc<dyn PropertyService>>,
    user_id: web::ReqData<String>,
) -> Result<HttpResponse, Error> {
    let context = SecurityContext::new(Uuid::parse_str(&user_id.into_inner())
        .map_err(actix_web::error::ErrorBadRequest)?);

    let properties = property_service
        .list_properties(&context)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    let responses: Vec<PropertyResponse> = properties
        .into_iter()
        .map(|p| PropertyResponse {
            id: p.id(),
            name: p.name().to_string(),
            description: p.description().to_string(),
            nsn: p.nsn().cloned(),
            serial_number: p.serial_number().cloned(),
            is_sensitive: p.is_sensitive(),
            quantity: p.quantity(),
            custodian: p.custodian().cloned(),
            qr_code: None,
            status: format!("{:?}", p.status()),
        })
        .collect();

    Ok(HttpResponse::Ok().json(responses))
}

/// Generates QR code for property
pub async fn generate_qr(
    qr_service: web::Data<Arc<dyn QRCodeService>>,
    id: web::Path<Uuid>,
    user_id: web::ReqData<String>,
    format: web::Query<QRFormatQuery>,
) -> Result<HttpResponse, Error> {
    let context = SecurityContext::new(Uuid::parse_str(&user_id.into_inner())
        .map_err(actix_web::error::ErrorBadRequest)?);

    let qr_format = match format.format.as_deref() {
        Some("svg") => QRFormat::SVG,
        _ => QRFormat::PNG,
    };

    let qr_data = QRData {
        id: Uuid::new_v4(),
        property_id: *id,
        metadata: serde_json::json!({}),
        timestamp: chrono::Utc::now(),
    };

    let qr_code = qr_service
        .generate_qr(&qr_data, qr_format, &context)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(qr_code))
}

#[derive(Debug, Deserialize)]
pub struct QRFormatQuery {
    format: Option<String>,
}

/// Configures property routes
pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/property")
            .route("", web::post().to(create_property))
            .route("/my", web::get().to(get_my_property))
            .route("/{id}", web::get().to(get_property))
            .route("/{id}", web::put().to(update_property))
            .route("/{id}/qr", web::get().to(generate_qr)),
    );
}

pub async fn get_sync_status(
    id: web::Path<Uuid>,
    context: web::ReqData<SecurityContext>,
) -> Result<HttpResponse, Error> {
    // Implementation here
    Ok(HttpResponse::Ok().json(()))
}
