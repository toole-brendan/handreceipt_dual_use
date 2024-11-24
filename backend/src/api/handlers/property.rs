use actix_web::{web, HttpResponse, Error};
use serde::{Serialize, Deserialize};
use uuid::Uuid;
use std::sync::Arc;

use crate::{
    domain::{
        property::{
            Property,
            PropertyService,
            CreatePropertyInput,
        },
        models::qr::{
            QRCodeService,
            QRFormat,
            QRResponse as QRCodeResponse,
        },
    },
    application::services::transfer_service::{
        TransferService,
        InitiateTransferInput,
        TransferResponse,
    },
    types::security::SecurityContext,
};

/// Request to create new property
#[derive(Debug, Deserialize)]
pub struct CreatePropertyRequest {
    pub name: String,
    pub description: String,
    pub nsn: Option<String>,
    pub serial_number: Option<String>,
    pub model_number: Option<String>,
    pub is_sensitive: bool,
    pub quantity: i32,
    pub unit_of_issue: String,
    pub value: Option<f64>,
    pub location: Option<String>,
}

/// Request to initiate a transfer
#[derive(Debug, Deserialize)]
pub struct InitiateTransferRequest {
    pub qr_data: String,
    pub new_custodian: String,
    pub location: Option<String>,
    pub notes: Option<String>,
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
    pub qr_code: Option<QRCodeResponse>,
    pub status: String,
}

/// Creates a new property item
pub async fn create_property(
    property_service: web::Data<Arc<dyn PropertyService>>,
    qr_service: web::Data<Arc<dyn QRCodeService>>,
    user_id: web::ReqData<String>,
    request: web::Json<CreatePropertyRequest>,
) -> Result<HttpResponse, Error> {
    let context = SecurityContext::new(user_id.into_inner());

    // Create property
    let property = property_service
        .create_property(
            CreatePropertyInput {
                name: request.name.clone(),
                description: request.description.clone(),
                nsn: request.nsn.clone(),
                serial_number: request.serial_number.clone(),
                model_number: request.model_number.clone(),
                is_sensitive: request.is_sensitive,
                quantity: request.quantity,
                unit_of_issue: request.unit_of_issue.clone(),
                value: request.value,
                location: request.location.clone().map(|building| crate::domain::property::Location {
                    building,
                    room: None,
                    notes: None,
                    grid_coordinates: None,
                }),
            },
            &context,
        )
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    // Generate QR code
    let qr_code = qr_service
        .generate_qr(property.id(), QRFormat::PNG, &context)
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
        qr_code: Some(qr_code),
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
    let context = SecurityContext::new(user_id.into_inner());
    let property = property_service
        .get_property(id.into_inner(), &context)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    let qr_code = qr_service
        .generate_qr(property.id(), QRFormat::PNG, &context)
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
        qr_code: Some(qr_code),
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
    let context = SecurityContext::new(user_id.into_inner());
    let property = property_service
        .update_property(
            id.into_inner(),
            CreatePropertyInput {
                name: request.name.clone(),
                description: request.description.clone(),
                nsn: request.nsn.clone(),
                serial_number: request.serial_number.clone(),
                model_number: request.model_number.clone(),
                is_sensitive: request.is_sensitive,
                quantity: request.quantity,
                unit_of_issue: request.unit_of_issue.clone(),
                value: request.value,
                location: request.location.clone().map(|building| crate::domain::property::Location {
                    building,
                    room: None,
                    notes: None,
                    grid_coordinates: None,
                }),
            },
            &context,
        )
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
        qr_code: None,
        status: format!("{:?}", property.status()),
    }))
}

/// Gets property for current user
pub async fn get_my_property(
    property_service: web::Data<Arc<dyn PropertyService>>,
    user_id: web::ReqData<String>,
) -> Result<HttpResponse, Error> {
    let context = SecurityContext::new(user_id.into_inner());
    let properties = property_service
        .get_custodian_property(&context)
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
            qr_code: None, // Don't generate QR codes for list view
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
    let context = SecurityContext::new(user_id.into_inner());
    let qr_format = match format.format.as_deref() {
        Some("svg") => QRFormat::SVG,
        _ => QRFormat::PNG,
    };

    let qr_code = qr_service
        .generate_qr(id.into_inner(), qr_format, &context)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(qr_code))
}

/// Searches for property based on criteria
pub async fn search_property(
    property_service: web::Data<Arc<dyn PropertyService>>,
    query: web::Query<PropertySearchQuery>,
    user_id: web::ReqData<String>,
) -> Result<HttpResponse, Error> {
    let context = SecurityContext::new(user_id.into_inner());
    let properties = property_service
        .search_property(query.into_inner().into(), &context)
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

/// Initiates a property transfer
pub async fn initiate_transfer(
    transfer_service: web::Data<Arc<dyn TransferService>>,
    user_id: web::ReqData<String>,
    request: web::Json<InitiateTransferRequest>,
) -> Result<HttpResponse, Error> {
    let context = SecurityContext::new(user_id.into_inner());
    let transfer = transfer_service
        .initiate_transfer(
            InitiateTransferInput {
                qr_data: request.qr_data.clone(),
                new_custodian: request.new_custodian.clone(),
                location: request.location.clone(),
                notes: request.notes.clone(),
            },
            &context,
        )
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(transfer))
}

/// Gets transfer history for current user
pub async fn get_my_transfers(
    transfer_service: web::Data<Arc<dyn TransferService>>,
    user_id: web::ReqData<String>,
) -> Result<HttpResponse, Error> {
    let context = SecurityContext::new(user_id.into_inner());
    let transfers = transfer_service
        .get_custodian_transfers(&context)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(transfers))
}

/// Gets a specific transfer
pub async fn get_transfer(
    transfer_service: web::Data<Arc<dyn TransferService>>,
    id: web::Path<Uuid>,
    user_id: web::ReqData<String>,
) -> Result<HttpResponse, Error> {
    let context = SecurityContext::new(user_id.into_inner());
    let transfer = transfer_service
        .get_transfer(id.into_inner(), &context)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(transfer))
}

/// Cancels a transfer
pub async fn cancel_transfer(
    transfer_service: web::Data<Arc<dyn TransferService>>,
    id: web::Path<Uuid>,
    user_id: web::ReqData<String>,
) -> Result<HttpResponse, Error> {
    let context = SecurityContext::new(user_id.into_inner());
    let transfer = transfer_service
        .cancel_transfer(id.into_inner(), &context)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(transfer))
}

#[derive(Debug, Deserialize)]
pub struct QRFormatQuery {
    format: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct PropertySearchQuery {
    pub name: Option<String>,
    pub nsn: Option<String>,
    pub serial_number: Option<String>,
    pub custodian: Option<String>,
    pub is_sensitive: Option<bool>,
}

/// Configures property routes
pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/property")
            .route("", web::post().to(create_property))
            .route("/my", web::get().to(get_my_property))
            .route("/search", web::get().to(search_property))
            .route("/{id}", web::get().to(get_property))
            .route("/{id}", web::put().to(update_property))
            .route("/{id}/qr", web::get().to(generate_qr))
            .route("/transfer", web::post().to(initiate_transfer))
            .route("/transfer/my", web::get().to(get_my_transfers))
            .route("/transfer/{id}", web::get().to(get_transfer))
            .route("/transfer/{id}/cancel", web::post().to(cancel_transfer)),
    );
}
