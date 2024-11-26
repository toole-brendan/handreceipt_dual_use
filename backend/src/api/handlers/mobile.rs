use actix_web::{web, HttpResponse, Error};
use serde::{Serialize, Deserialize};
use uuid::Uuid;
use std::sync::Arc;

use crate::{
    domain::{
        property::{
            entity::{Property, PropertyCategory},
        },
        models::{
            qr::{QRCodeService, QRFormat, QRData},
            location::Location,
        },
    },
    types::{
        app::PropertyService,
        security::SecurityContext,
    },
};

/// Mobile property response
#[derive(Debug, Serialize)]
pub struct MobilePropertyResponse {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub nsn: String,
    pub serial_number: String,
    pub is_sensitive: bool,
    pub quantity: i32,
    pub current_custodian: Option<String>,
    pub qr_code: Option<Vec<u8>>,
    pub status: String,
}

/// Gets property details for mobile app
pub async fn get_property_details(
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

    let qr_data = QRData::new(
        property.id(),
        context.user_id.to_string(),
        serde_json::json!({
            "name": property.name(),
            "description": property.description(),
            "nsn": property.nsn(),
            "serial_number": property.serial_number(),
        }),
    );

    let qr_code = qr_service
        .generate_qr(&qr_data, QRFormat::PNG, &context)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(MobilePropertyResponse {
        id: property.id(),
        name: property.name().to_string(),
        description: property.description().unwrap_or_default().to_string(),
        nsn: property.nsn().unwrap_or_default().to_string(),
        serial_number: property.serial_number().unwrap_or_default().to_string(),
        is_sensitive: property.is_sensitive(),
        quantity: property.quantity(),
        current_custodian: property.custodian().map(|s| s.to_string()),
        qr_code: Some(qr_code.data),
        status: format!("{:?}", property.status()),
    }))
}

/// Gets sync status for mobile app
pub async fn get_sync_status(
    _user_id: web::ReqData<String>,
) -> Result<HttpResponse, Error> {
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "status": "synced",
        "last_sync": "2024-01-01T00:00:00Z"
    })))
}

/// Configure mobile routes
pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/mobile")
            .route("/property/{id}", web::get().to(get_property_details))
            .route("/sync", web::get().to(get_sync_status)),
    );
}
