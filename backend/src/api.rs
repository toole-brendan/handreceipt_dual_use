// backend/src/api.rs

use actix_web::{
    web, HttpResponse, dev::ServiceRequest, HttpMessage
};
use serde::{Serialize, Deserialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use std::collections::HashMap;

// Import from types module
use crate::{
    models::UuidWrapper,
    types::{
        app::{AppState, DatabaseService},
        security::{SecurityContext, SecurityClassification},
        permissions::{ResourceType, Action},
        asset::{Asset, AssetStatus},
        blockchain::{Block, Transaction, BlockchainTransaction},
        error::CoreError,
        sync::{SyncType, SyncRequest, BroadcastMessage, SyncPriority},
        audit::{AuditEvent, AuditStatus, AuditEventType, AuditContext, AuditSeverity},
        signature::{CommandSignature, SignatureType},
    },
    services::{
        core::security::SecurityModule,
        network::mesh::MeshService,
    },
};

// Import handlers
use crate::handlers::{
    health_handlers,
    asset_handlers,
    qr_handlers,
    user_handlers,
};

// Keep existing structs but update type references
#[derive(Debug, Serialize, Deserialize)]
pub struct CreateAssetRequest {
    pub name: String,
    pub description: String,
    pub classification: SecurityClassification,
    pub metadata: Option<HashMap<String, String>>,
    pub signature: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateAssetRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub status: Option<AssetStatus>,
    pub metadata: Option<HashMap<String, String>>,
    pub signature: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SignatureRequest {
    pub signature: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ValidationRequest {
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BroadcastRequest {
    pub message: String,
}

#[derive(Debug, Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub message: Option<String>,
    pub data: Option<T>,
    pub timestamp: DateTime<Utc>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            message: None,
            data: Some(data),
            timestamp: Utc::now(),
        }
    }

    pub fn error(message: String) -> Self {
        Self {
            success: false,
            message: Some(message),
            data: None,
            timestamp: Utc::now(),
        }
    }
}
/// Route Configuration
pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg
        // Health check at root level
        .route("/health", web::get().to(health_check))
        // API routes under /api/v1
        .service(
            web::scope("/api/v1")
                // User routes
                .service(
                    web::scope("/user")
                        .route("/preferences", web::get().to(user_handlers::get_user_preferences))
                )
                // Asset Management
                .service(
                    web::scope("/assets")
                        .route("", web::get().to(asset_handlers::list_assets))
                        .route("", web::post().to(asset_handlers::create_asset))
                        .route("/{id}", web::get().to(asset_handlers::get_asset))
                        .route("/{id}", web::put().to(asset_handlers::update_asset))
                        .route("/{id}", web::delete().to(asset_handlers::delete_asset))
                        // QR code routes
                        .route("/{id}/qr", web::get().to(asset_handlers::get_asset_qr))
                        .route("/{id}/verify", web::post().to(asset_handlers::verify_asset_scan))
                )
                // QR Code Management
                .service(
                    web::scope("/qr")
                        .route("/generate/{id}", web::get().to(qr_handlers::generate_asset_qr))
                        .route("/verify", web::post().to(qr_handlers::verify_qr_code))
                )
        );

    cfg.service(
        web::scope("/api")
            .service(
                web::resource("/rfid/scan")
                    .route(web::get().to(asset_handlers::scan_rfid_tag))
            )
            .service(
                web::resource("/assets/{id}/rfid")
                    .route(web::post().to(asset_handlers::associate_rfid_tag))
            )
    );
}

/// Handler Implementations
pub mod handlers {
    use super::*;
    use actix_web::{web, HttpResponse, Error};

    /// Asset Management Handlers
    pub async fn create_asset(
        state: web::Data<AppState>,
        asset_data: web::Json<Asset>,
        security_context: web::ReqData<SecurityContext>,
    ) -> Result<HttpResponse, Error> {
        // Create audit event
        let event = AuditEvent {
            id: Uuid::new_v4(),
            timestamp: Utc::now(),
            event_type: AuditEventType::AssetCreated,
            status: AuditStatus::Success,
            details: serde_json::json!({
                "asset_name": asset_data.name,
                "classification": asset_data.classification,
            }),
            context: AuditContext {
                user_id: Some(security_context.user_id.to_string()),
                resource_id: None,
                action: "CREATE_ASSET".to_string(),
                severity: AuditSeverity::Medium,
                metadata: None,
            },
        };

        // Log the event
        state.audit_logger.log_event(event, &security_context)
            .await
            .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

        // Create asset
        let mut asset = asset_data.into_inner();
        
        // Store in database
        state.db.update_asset(&asset, &security_context)
            .await
            .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

        // Create blockchain transaction
        let transaction = Transaction {
            id: Uuid::new_v4(),
            timestamp: Utc::now(),
            data: serde_json::to_string(&asset)?,
            signature: String::new(),
            classification: asset.classification.clone(),
        };

        // Submit to blockchain
        state.blockchain.submit_transaction(transaction.data.as_bytes().to_vec())
            .await
            .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

        Ok(HttpResponse::Created().json(asset))
    }

    pub async fn list_assets(
        state: web::Data<AppState>,
        security_context: web::ReqData<SecurityContext>,
    ) -> Result<HttpResponse, Error> {
        // Validate permissions
        if !security_context.has_permission(&ResourceType::Asset, &Action::Read) {
            return Ok(HttpResponse::Forbidden().json(ApiResponse::<()>::error(
                "Insufficient permissions".to_string(),
            )));
        }

        // Query assets from database
        let rows = state
            .database
            .execute_query(
                "SELECT data FROM assets WHERE classification <= $1",
                &[&security_context.classification],
                &security_context,
            )
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;

        // Deserialize assets
        let assets: Vec<Asset> = rows
            .iter()
            .filter_map(|row| {
                let data: &str = row.get(0);
                serde_json::from_str(data).ok()
            })
            .collect();

        Ok(HttpResponse::Ok().json(ApiResponse::success(assets)))
    }

    pub async fn get_asset(
        state: web::Data<AppState>,
        id: web::Path<Uuid>,
        security_context: web::ReqData<SecurityContext>,
    ) -> Result<HttpResponse, Error> {
        let asset_id = id.into_inner();
        let rows = state
            .database
            .execute_query(
                "SELECT data FROM assets WHERE id = $1 AND classification <= $2",
                &[&asset_id, &security_context.classification],
                &security_context,
            )
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;

        if let Some(row) = rows.get(0) {
            let data: &str = row.get(0);
            let asset: Asset = serde_json::from_str(data)
                .map_err(actix_web::error::ErrorInternalServerError)?;
            Ok(HttpResponse::Ok().json(ApiResponse::success(asset)))
        } else {
            Ok(HttpResponse::NotFound().json(ApiResponse::<()>::error(
                "Asset not found".to_string(),
            )))
        }
    }

    pub async fn update_asset(
        state: web::Data<AppState>,
        id: web::Path<Uuid>,
        req: web::Json<UpdateAssetRequest>,
        security_context: web::ReqData<SecurityContext>,
    ) -> Result<HttpResponse, Error> {
        // Extract UUID once at the beginning
        let asset_id = id.into_inner();

        // Validate permissions
        if !security_context.has_permission(&ResourceType::Asset, &Action::Update) {
            return Ok(HttpResponse::Forbidden().json(ApiResponse::<()>::error(
                "Insufficient permissions".to_string(),
            )));
        }

        // Query existing asset
        let rows = state
            .database
            .execute_query(
                "SELECT data FROM assets WHERE id = $1 AND classification <= $2",
                &[
                    &UuidWrapper(asset_id),
                    &security_context.classification,
                ],
                &security_context,
            )
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;

        if let Some(row) = rows.get(0) {
            let data: &str = row.get(0);
            let mut asset: Asset = serde_json::from_str(data)
                .map_err(actix_web::error::ErrorInternalServerError)?;

            // Update asset fields
            if let Some(name) = &req.name {
                asset.name = name.clone();
            }
            if let Some(description) = &req.description {
                asset.description = description.clone();
            }
            if let Some(status) = &req.status {
                asset.status = status.clone();
            }
            if let Some(metadata) = &req.metadata {
                for (key, value) in metadata {
                    asset.update_metadata(key.clone(), value.clone());
                }
            }

            // Serialize updated asset
            let asset_data = serde_json::to_string(&asset)
                .map_err(actix_web::error::ErrorInternalServerError)?;

            // Create transaction
            let signature = CommandSignature::new(
                security_context.user_id,
                SignatureType::Asset,
                format!("HASH_{}", Uuid::new_v4()),
                req.signature.clone().unwrap_or_default(),
                security_context.classification.clone(),
            );

            let transaction = Transaction {
                id: Uuid::new_v4(),
                timestamp: Utc::now(),
                data: asset_data.clone(),
                signature: signature.signature.clone(),
                classification: asset.classification.clone(),
            };

            // Add transaction to blockchain
            state
                .blockchain
                .add_transaction(Transaction {
                    id: transaction.id,
                    timestamp: transaction.timestamp,
                    data: transaction.data,
                    signature: transaction.signature,
                    classification: transaction.classification,
                }, &security_context)
                .await
                .map_err(actix_web::error::ErrorInternalServerError)?;

            // Update asset in database
            state
                .database
                .execute_query(
                    "UPDATE assets SET data = $1 WHERE id = $2",
                    &[
                        &asset_data,
                        &asset.id,
                    ],
                    &security_context,
                )
                .await
                .map_err(actix_web::error::ErrorInternalServerError)?;

            Ok(HttpResponse::Ok().json(ApiResponse::success(asset)))
        } else {
            Ok(HttpResponse::NotFound().json(ApiResponse::<()>::error(
                "Asset not found".to_string(),
            )))
        }
    }

    pub async fn delete_asset(
        state: web::Data<AppState>,
        id: web::Path<Uuid>,
        security_context: web::ReqData<SecurityContext>,
    ) -> Result<HttpResponse, Error> {
        // Validate permissions
        if !security_context.has_permission(&ResourceType::Asset, &Action::Delete) {
            return Ok(HttpResponse::Forbidden().json(ApiResponse::<()>::error(
                "Insufficient permissions".to_string(),
            )));
        }

        // Soft-delete asset by updating status to Deleted
        let result = state
            .database
            .execute_query(
                "UPDATE assets SET status = $1 WHERE id = $2 AND classification <= $3 RETURNING id",
                &[
                    &AssetStatus::Deleted.to_string(),
                    &id.into_inner(),
                    &security_context.classification.to_string(),
                ],
                &security_context,
            )
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;

        if !result.is_empty() {
            Ok(HttpResponse::Ok().json(ApiResponse::success(())))
        } else {
            Ok(HttpResponse::NotFound().json(ApiResponse::<()>::error(
                "Asset not found".to_string(),
            )))
        }
    }

    /// Blockchain Operation Handlers

    pub async fn create_transaction(
        state: web::Data<AppState>,
        req: web::Json<serde_json::Value>,
        security_context: web::ReqData<SecurityContext>,
    ) -> Result<HttpResponse, actix_web::Error> {
        let transaction = BlockchainTransaction {
            id: Uuid::new_v4(),
            timestamp: Utc::now(),
            data: req.into_inner().to_string(),
            signature: "".to_string(),
            classification: security_context.classification.clone(),
        };

        state
            .blockchain
            .add_transaction(Transaction {
                id: transaction.id,
                timestamp: transaction.timestamp,
                data: transaction.data,
                signature: transaction.signature,
                classification: transaction.classification,
            }, &security_context)
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;

        Ok(HttpResponse::Created().json(ApiResponse::success("Transaction created")))
    }

    pub async fn list_transactions(
        state: web::Data<AppState>,
        security_context: web::ReqData<SecurityContext>,
    ) -> Result<HttpResponse, actix_web::Error> {
        if !security_context.has_permission(&ResourceType::Transaction, &Action::Read) {
            return Ok(HttpResponse::Forbidden().json(ApiResponse::<()>::error(
                "Insufficient permissions".to_string(),
            )));
        }

        let transactions = state
            .blockchain
            .get_pending_transactions()
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;

        Ok(HttpResponse::Ok().json(ApiResponse::success(transactions)))
    }

    pub async fn mine_block(
        state: web::Data<AppState>,
        security_context: web::ReqData<SecurityContext>,
    ) -> Result<HttpResponse, Error> {
        if !security_context.has_permission(&ResourceType::Block, &Action::Create) {
            return Ok(HttpResponse::Forbidden().json(ApiResponse::<()>::error(
                "Insufficient permissions".to_string(),
            )));
        }

        let block = state
            .blockchain
            .mine_block()
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;

        Ok(HttpResponse::Created().json(ApiResponse::success(block)))
    }

    pub async fn verify_block(
        state: web::Data<AppState>,
        block: web::Json<Block>,
        security_context: web::ReqData<SecurityContext>,
    ) -> Result<HttpResponse, Error> {
        if !security_context.has_permission(&ResourceType::Block, &Action::Verify) {
            return Ok(HttpResponse::Forbidden().json(ApiResponse::<()>::error(
                "Insufficient permissions".to_string(),
            )));
        }

        let is_valid = state
            .blockchain
            .verify_block(&block.into_inner())
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;

        if is_valid {
            Ok(HttpResponse::Ok().json(ApiResponse::success("Block is valid")))
        } else {
            Ok(HttpResponse::BadRequest().json(ApiResponse::<()>::error(
                "Block verification failed".to_string(),
            )))
        }
    }

    /// Mesh Network Handlers

    #[derive(Debug, Serialize, Deserialize)]
    pub struct RegisterNodeRequest {
        pub id: String,
        pub address: String,
    }

    pub async fn register_node(
        state: web::Data<AppState>,
        req: web::Json<RegisterNodeRequest>,
        _security_context: web::ReqData<SecurityContext>,
    ) -> Result<HttpResponse, Error> {
        // Use blockchain instead of mesh_network
        state.blockchain
            .add_peer(req.address.clone())
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;

        Ok(HttpResponse::Created().json(ApiResponse::success("Node registered")))
    }

    pub async fn list_nodes(
        state: web::Data<AppState>,
        security_context: web::ReqData<SecurityContext>,
    ) -> Result<HttpResponse, Error> {
        // Validate permissions
        if !security_context.has_permission(&ResourceType::Node, &Action::Read) {
            return Ok(HttpResponse::Forbidden().json(ApiResponse::<()>::error(
                "Insufficient permissions".to_string(),
            )));
        }

        // Get network metrics instead of mesh_network status
        let metrics = state
            .blockchain
            .get_network_metrics()
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;

        Ok(HttpResponse::Ok().json(ApiResponse::success(metrics)))
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct ConnectionRequest {
        pub source: String,
        pub target: String,
    }

    pub async fn establish_connection(
        state: web::Data<AppState>,
        req: web::Json<ConnectionRequest>,
        security_context: web::ReqData<SecurityContext>,
    ) -> Result<HttpResponse, Error> {
        // Validate permissions
        if !security_context.has_permission(&ResourceType::Node, &Action::Update) {
            return Ok(HttpResponse::Forbidden().json(ApiResponse::<()>::error(
                "Insufficient permissions".to_string(),
            )));
        }

        // Use blockchain's peer management instead
        state.blockchain
            .add_peer(req.target.clone())
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;

        Ok(HttpResponse::Created().json(ApiResponse::success("Connection established")))
    }

    pub async fn broadcast_message(
        state: web::Data<AppState>,
        req: web::Json<BroadcastRequest>,
        security_context: web::ReqData<SecurityContext>,
    ) -> Result<HttpResponse, Error> {
        if !security_context.has_permission(&ResourceType::Node, &Action::Broadcast) {
            return Ok(HttpResponse::Forbidden().json(ApiResponse::<()>::error(
                "Insufficient permissions".to_string(),
            )));
        }

        let broadcast_msg = BroadcastMessage::new(
            req.message.clone(),
            SyncPriority::Normal,
        );

        state
            .blockchain
            .broadcast_message(&broadcast_msg)
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;

        Ok(HttpResponse::Ok().json(ApiResponse::success("Message broadcasted")))
    }

    /// Synchronization Handlers

    pub async fn initiate_sync(
        state: web::Data<AppState>,
        req: web::Json<SyncRequest>,
        security_context: web::ReqData<SecurityContext>,
    ) -> Result<HttpResponse, Error> {
        // Validate permissions
        if !security_context.has_permission(&ResourceType::System, &Action::Execute) {
            return Ok(HttpResponse::Forbidden().json(ApiResponse::<()>::error(
                "Insufficient permissions".to_string(),
            )));
        }

        // Serialize target nodes
        let target = serde_json::to_string(&req.target_nodes)
            .map_err(actix_web::error::ErrorInternalServerError)?;

        // Schedule sync
        let sync_id = state
            .sync_manager
            .schedule_sync(target, &security_context)
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;

        Ok(HttpResponse::Accepted().json(ApiResponse::success(sync_id)))
    }

    pub async fn sync_status(
        state: web::Data<AppState>,
        security_context: web::ReqData<SecurityContext>,
    ) -> Result<HttpResponse, Error> {
        // Validate permissions
        if !security_context.has_permission(&ResourceType::System, &Action::Read) {
            return Ok(HttpResponse::Forbidden().json(ApiResponse::<()>::error(
                "Insufficient permissions".to_string(),
            )));
        }

        // Get sync status
        let status = state
            .sync_manager
            .get_sync_status()
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;

        Ok(HttpResponse::Ok().json(ApiResponse::success(status)))
    }

    pub async fn get_network_status(
        state: web::Data<AppState>,
        _security_context: web::ReqData<SecurityContext>,
    ) -> Result<HttpResponse, Error> {
        let network_metrics = state
            .blockchain
            .get_network_metrics()
            .await
            .map_err(|e| actix_web::error::ErrorInternalServerError(e.to_string()))?;

        Ok(HttpResponse::Ok().json(ApiResponse::success(network_metrics)))
    }
}

/// Error Handler
impl actix_web::error::ResponseError for CoreError {
    fn error_response(&self) -> HttpResponse {
        match self {
            CoreError::SecurityViolation(msg) => HttpResponse::Forbidden()
                .json(ApiResponse::<()>::error(msg.clone())),
            CoreError::ValidationError(msg) => HttpResponse::BadRequest()
                .json(ApiResponse::<()>::error(msg.clone())),
            CoreError::AuthenticationError(msg) => HttpResponse::Unauthorized()
                .json(ApiResponse::<()>::error(msg.clone())),
            CoreError::NetworkError(msg) => HttpResponse::ServiceUnavailable()
                .json(ApiResponse::<()>::error(msg.clone())),
            CoreError::BlockchainError(msg) => HttpResponse::InternalServerError()
                .json(ApiResponse::<()>::error(msg.clone())),
            CoreError::SyncError(msg) => HttpResponse::ServiceUnavailable()
                .json(ApiResponse::<()>::error(msg.clone())),
            CoreError::EncryptionError(msg) => HttpResponse::InternalServerError()
                .json(ApiResponse::<()>::error(msg.clone())),
            CoreError::SignatureError(msg) => HttpResponse::BadRequest()
                .json(ApiResponse::<()>::error(msg.clone())),
            CoreError::ChainOfCustodyError(msg) => HttpResponse::BadRequest()
                .json(ApiResponse::<()>::error(msg.clone())),
            CoreError::TimestampError(msg) => HttpResponse::BadRequest()
                .json(ApiResponse::<()>::error(msg.clone())),
            CoreError::ScanningError(msg) => HttpResponse::BadRequest()
                .json(ApiResponse::<()>::error(msg.clone())),
            CoreError::MeshNetworkError(msg) => HttpResponse::ServiceUnavailable()
                .json(ApiResponse::<()>::error(msg.clone())),
            CoreError::MobileSyncError(msg) => HttpResponse::ServiceUnavailable()
                .json(ApiResponse::<()>::error(msg.clone())),
            CoreError::RFIDError(msg) => HttpResponse::BadRequest()
                .json(ApiResponse::<()>::error(msg.clone())),
            _ => HttpResponse::InternalServerError()
                .json(ApiResponse::<()>::error("Internal server error".to_string())),
        }
    }
}

/// Middleware for Processing Requests
pub async fn process_request(
    req: ServiceRequest,
) -> Result<ServiceRequest, actix_web::Error> {
    if let Some(auth_header) = req.headers().get("Authorization") {
        let auth_str = auth_header.to_str().map_err(|e| {
            actix_web::error::ErrorUnauthorized(format!("Invalid authorization header: {}", e))
        })?;

        let security_context = create_security_context(auth_str).map_err(|e| {
            actix_web::error::ErrorUnauthorized(format!("Invalid security context: {}", e))
        })?;

        req.extensions_mut().insert(security_context);
    }
    Ok(req)
}

fn create_security_context(
    auth_str: &str,
) -> Result<SecurityContext, Box<dyn std::error::Error>> {
    // For now, create a basic security context
    Ok(SecurityContext::new(
        SecurityClassification::Unclassified,
        Uuid::new_v4(),
        auth_str.to_string(),
        vec![],
    ))
}

pub async fn health_check() -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::success("Service is healthy"))
}

