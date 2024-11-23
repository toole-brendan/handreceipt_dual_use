use actix_web::{web, HttpResponse, Error};
use serde::{Serialize, Deserialize};
use uuid::Uuid;
use std::sync::Arc;

use crate::{
    domain::property::{
        Property,
        PropertyService,
        CreatePropertyInput,
    },
    application::services::{
        qr_service::QRService,
        transfer_service::{
            TransferService,
            InitiateTransferInput,
            TransferResponse,
        },
    },
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
    pub qr_code: Option<String>,
    pub status: String,
}

/// Creates a new property item
pub async fn create_property(
    property_service: web::Data<Arc<dyn PropertyService>>,
    qr_service: web::Data<Arc<QRService>>,
    user_id: web::ReqData<String>,
    request: web::Json<CreatePropertyRequest>,
) -> Result<HttpResponse, Error> {
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
            user_id.into_inner(),
        )
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    // Generate QR code
    let qr_code = qr_service
        .generate_property_qr(property.id())
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
    qr_service: web::Data<Arc<QRService>>,
    id: web::Path<Uuid>,
) -> Result<HttpResponse, Error> {
    let property = property_service
        .get_property(id.into_inner())
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    let qr_code = qr_service
        .generate_property_qr(property.id())
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

/// Gets property for current user
pub async fn get_my_property(
    property_service: web::Data<Arc<dyn PropertyService>>,
    user_id: web::ReqData<String>,
) -> Result<HttpResponse, Error> {
    let properties = property_service
        .get_custodian_property(&user_id)
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

/// Initiates a property transfer
pub async fn initiate_transfer(
    transfer_service: web::Data<Arc<dyn TransferService>>,
    user_id: web::ReqData<String>,
    request: web::Json<InitiateTransferRequest>,
) -> Result<HttpResponse, Error> {
    let transfer = transfer_service
        .initiate_transfer(
            InitiateTransferInput {
                qr_data: request.qr_data.clone(),
                new_custodian: request.new_custodian.clone(),
                location: request.location.clone(),
                notes: request.notes.clone(),
            },
            user_id.into_inner(),
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
    let transfers = transfer_service
        .get_custodian_transfers(&user_id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(transfers))
}

/// Gets a specific transfer
pub async fn get_transfer(
    transfer_service: web::Data<Arc<dyn TransferService>>,
    id: web::Path<Uuid>,
) -> Result<HttpResponse, Error> {
    let transfer = transfer_service
        .get_transfer(id.into_inner())
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
    let transfer = transfer_service
        .cancel_transfer(id.into_inner(), user_id.into_inner())
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(transfer))
}

/// Configures property routes
pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/property")
            .route("", web::post().to(create_property))
            .route("/my", web::get().to(get_my_property))
            .route("/{id}", web::get().to(get_property))
            .route("/transfer", web::post().to(initiate_transfer))
            .route("/transfer/my", web::get().to(get_my_transfers))
            .route("/transfer/{id}", web::get().to(get_transfer))
            .route("/transfer/{id}/cancel", web::post().to(cancel_transfer)),
    );
}
