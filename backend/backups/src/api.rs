use actix_web::{web, HttpResponse, HttpServer, App, Error as ActixError};
use std::sync::Arc;
use uuid::Uuid;
use chrono::Utc;

use crate::{
    error::CoreError,
    types::{
        app::{AppState, AppConfig, DatabaseService, SecurityService, AssetVerification, AuditLogger, SyncManager, MeshService, P2PService, BlockchainService},
        blockchain::{Block, Transaction, TransactionType, BlockchainTransaction},
        signature::CommandSignature,
        security::{SecurityContext, SecurityClassification, SecurityLevel, SecurityZone},
        audit::{
            AuditEvent, AuditEventType, AuditContext, AuditSeverity, AuditStatus,
            SignatureMetadata, SignatureType, SignatureAlgorithm,
        },
        sync::{SyncStatus, SyncType, SyncRequest, SyncPriority, BroadcastMessage},
        validation::ValidationContext,
        mesh::{PeerInfo, Message, MessageType},
    },
    handlers::{
        asset_handlers,
        qr_handlers,
        transfer_handlers,
        user_handlers,
        websocket_handlers,
    },
};

pub struct ApiServer {
    app_state: Arc<AppState<
        crate::services::infrastructure::InfrastructureService,
        crate::security::SecurityModule,
        crate::services::core::verification::VerificationService,
        crate::services::core::audit::AuditLoggerImpl,
        crate::services::network::sync::SyncManager,
        crate::services::network::mesh::MeshService,
        crate::services::network::p2p::P2PService,
    >>,
}

impl ApiServer {
    pub fn new(app_state: Arc<AppState<
        crate::services::infrastructure::InfrastructureService,
        crate::security::SecurityModule,
        crate::services::core::verification::VerificationService,
        crate::services::core::audit::AuditLoggerImpl,
        crate::services::network::sync::SyncManager,
        crate::services::network::mesh::MeshService,
        crate::services::network::p2p::P2PService,
    >>) -> Self {
        Self { app_state }
    }

    pub async fn run(&self, host: &str, port: u16) -> std::io::Result<()> {
        HttpServer::new(move || {
            App::new()
                .app_data(web::Data::new(self.app_state.clone()))
                .service(web::scope("/api/v1")
                    .service(web::resource("/assets")
                        .route(web::get().to(asset_handlers::list_assets))
                        .route(web::post().to(asset_handlers::create_asset)))
                    .service(web::resource("/assets/{id}")
                        .route(web::get().to(asset_handlers::get_asset))
                        .route(web::put().to(asset_handlers::update_asset))
                        .route(web::delete().to(asset_handlers::delete_asset)))
                    .service(web::resource("/qr")
                        .route(web::post().to(qr_handlers::generate_qr)))
                    .service(web::resource("/qr/{id}")
                        .route(web::get().to(qr_handlers::get_qr))
                        .route(web::delete().to(qr_handlers::delete_qr)))
                    .service(web::resource("/transfers")
                        .route(web::post().to(transfer_handlers::create_transfer)))
                    .service(web::resource("/transfers/{id}")
                        .route(web::get().to(transfer_handlers::get_transfer))
                        .route(web::put().to(transfer_handlers::update_transfer)))
                    .service(web::resource("/users/{id}")
                        .route(web::get().to(user_handlers::get_user_profile))
                        .route(web::put().to(user_handlers::update_user_profile)))
                    .service(web::resource("/ws")
                        .route(web::get().to(websocket_handlers::websocket_handler))))
        })
        .bind((host, port))?
        .run()
        .await
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

/// Route Configuration
pub fn configure_routes<DB, SEC, AV, AL, SM, MS, PS, BS>(cfg: &mut web::ServiceConfig) 
where
    DB: DatabaseService + 'static,
    SEC: SecurityService + 'static,
    AV: AssetVerification + 'static,
    AL: AuditLogger + 'static,
    SM: SyncManager + 'static,
    MS: MeshService + 'static,
    PS: P2PService + 'static,
    BS: BlockchainService + 'static,
{
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
    pub async fn create_asset<DB, SEC, AV, AL, SM, MS, PS, BS>(
        state: web::Data<AppState<DB, SEC, AV, AL, SM, MS, PS, BS>>,
        asset_data: web::Json<Asset>,
        security_context: web::ReqData<SecurityContext>,
    ) -> Result<HttpResponse, Error> 
    where
        DB: DatabaseService,
        SEC: SecurityService,
        AV: AssetVerification,
        AL: AuditLogger,
        SM: SyncManager,
        MS: MeshService,
        PS: P2PService,
        BS: BlockchainService,
    {
        // Create validation context
        let validation_context = ValidationContext::new(security_context.classification.clone());

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
        state.blockchain_service.broadcast_message(&BroadcastMessage::new(
            serde_json::to_string(&transaction)?,
            SyncPriority::High,
            transaction.classification.clone(),
        ), &security_context)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

        Ok(HttpResponse::Created().json(asset))
    }

    pub async fn list_assets<DB, SEC, AV, AL, SM, MS, PS, BS>(
        state: web::Data<AppState<DB, SEC, AV, AL, SM, MS, PS, BS>>,
        security_context: web::ReqData<SecurityContext>,
    ) -> Result<HttpResponse, Error>
    where
        DB: DatabaseService,
        SEC: SecurityService,
        AV: AssetVerification,
        AL: AuditLogger,
        SM: SyncManager,
        MS: MeshService,
        PS: P2PService,
        BS: BlockchainService,
    {
        // Validate permissions
        if !security_context.has_permission("asset", "read") {
            return Ok(HttpResponse::Forbidden().json(ApiResponse::<()>::error(
                "Insufficient permissions".to_string(),
            )));
        }

        // Query assets from database
        let assets = state.db.list_assets(&security_context)
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;

        Ok(HttpResponse::Ok().json(ApiResponse::success(assets)))
    }

    pub async fn get_asset<DB, SEC, AV, AL, SM, MS, PS, BS>(
        state: web::Data<AppState<DB, SEC, AV, AL, SM, MS, PS, BS>>,
        id: web::Path<Uuid>,
        security_context: web::ReqData<SecurityContext>,
    ) -> Result<HttpResponse, Error>
    where
        DB: DatabaseService,
        SEC: SecurityService,
        AV: AssetVerification,
        AL: AuditLogger,
        SM: SyncManager,
        MS: MeshService,
        PS: P2PService,
        BS: BlockchainService,
    {
        let asset_id = id.into_inner();
        
        let asset = state.db.get_asset(asset_id, &security_context)
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;

        match asset {
            Some(asset) => Ok(HttpResponse::Ok().json(ApiResponse::success(asset))),
            None => Ok(HttpResponse::NotFound().json(ApiResponse::<()>::error(
                "Asset not found".to_string(),
            ))),
        }
    }

    pub async fn update_asset<DB, SEC, AV, AL, SM, MS, PS, BS>(
        state: web::Data<AppState<DB, SEC, AV, AL, SM, MS, PS, BS>>,
        id: web::Path<Uuid>,
        req: web::Json<UpdateAssetRequest>,
        security_context: web::ReqData<SecurityContext>,
    ) -> Result<HttpResponse, Error>
    where
        DB: DatabaseService,
        SEC: SecurityService,
        AV: AssetVerification,
        AL: AuditLogger,
        SM: SyncManager,
        MS: MeshService,
        PS: P2PService,
        BS: BlockchainService,
    {
        // Extract UUID once at the beginning
        let asset_id = id.into_inner();

        // Validate permissions
        if !security_context.has_permission("asset", "update") {
            return Ok(HttpResponse::Forbidden().json(ApiResponse::<()>::error(
                "Insufficient permissions".to_string(),
            )));
        }

        // Get existing asset
        let mut asset = match state.db.get_asset(asset_id, &security_context).await {
            Ok(Some(asset)) => asset,
            Ok(None) => return Ok(HttpResponse::NotFound().json(ApiResponse::<()>::error(
                "Asset not found".to_string(),
            ))),
            Err(e) => return Err(actix_web::error::ErrorInternalServerError(e)),
        };

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
            asset.metadata = Some(metadata.clone());
        }

        // Create signature
        let signature = CommandSignature::new(
            security_context.user_id,
            SignatureType::Asset,
            format!("HASH_{}", Uuid::new_v4()),
            req.signature.clone().unwrap_or_default(),
            security_context.classification.clone(),
        );

        // Create transaction
        let transaction = Transaction {
            id: Uuid::new_v4(),
            timestamp: Utc::now(),
            data: serde_json::to_string(&asset)?,
            signature: signature.signature,
            classification: asset.classification.clone(),
        };

        // Broadcast transaction
        state.blockchain_service.broadcast_message(&BroadcastMessage::new(
            serde_json::to_string(&transaction)?,
            SyncPriority::High,
            transaction.classification.clone(),
        ), &security_context)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

        // Update asset in database
        state.db.update_asset(&asset, &security_context)
            .await
            .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

        Ok(HttpResponse::Ok().json(ApiResponse::success(asset)))
    }

    pub async fn delete_asset<DB, SEC, AV, AL, SM, MS, PS, BS>(
        state: web::Data<AppState<DB, SEC, AV, AL, SM, MS, PS, BS>>,
        id: web::Path<Uuid>,
        security_context: web::ReqData<SecurityContext>,
    ) -> Result<HttpResponse, Error>
    where
        DB: DatabaseService,
        SEC: SecurityService,
        AV: AssetVerification,
        AL: AuditLogger,
        SM: SyncManager,
        MS: MeshService,
        PS: P2PService,
        BS: BlockchainService,
    {
        // Validate permissions
        if !security_context.has_permission("asset", "delete") {
            return Ok(HttpResponse::Forbidden().json(ApiResponse::<()>::error(
                "Insufficient permissions".to_string(),
            )));
        }

        // Delete asset
        state.db.delete_asset(id.into_inner(), &security_context)
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;

        Ok(HttpResponse::Ok().json(ApiResponse::success(())))
    }

    /// Blockchain Operation Handlers

    pub async fn create_transaction<DB, SEC, AV, AL, SM, MS, PS, BS>(
        state: web::Data<AppState<DB, SEC, AV, AL, SM, MS, PS, BS>>,
        req: web::Json<serde_json::Value>,
        security_context: web::ReqData<SecurityContext>,
    ) -> Result<HttpResponse, actix_web::Error>
    where
        DB: DatabaseService,
        SEC: SecurityService,
        AV: AssetVerification,
        AL: AuditLogger,
        SM: SyncManager,
        MS: MeshService,
        PS: P2PService,
        BS: BlockchainService,
    {
        let transaction = BlockchainTransaction {
            id: Uuid::new_v4(),
            timestamp: Utc::now(),
            data: req.into_inner().to_string(),
            signature: "".to_string(),
            classification: security_context.classification.clone(),
        };

        // Broadcast transaction
        state.blockchain_service.broadcast_message(&BroadcastMessage::new(
            serde_json::to_string(&transaction)?,
            SyncPriority::High,
            transaction.classification.clone(),
        ), &security_context)
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

        Ok(HttpResponse::Created().json(ApiResponse::success("Transaction created")))
    }

    pub async fn broadcast_message<DB, SEC, AV, AL, SM, MS, PS, BS>(
        state: web::Data<AppState<DB, SEC, AV, AL, SM, MS, PS, BS>>,
        req: web::Json<BroadcastRequest>,
        security_context: web::ReqData<SecurityContext>,
    ) -> Result<HttpResponse, Error>
    where
        DB: DatabaseService,
        SEC: SecurityService,
        AV: AssetVerification,
        AL: AuditLogger,
        SM: SyncManager,
        MS: MeshService,
        PS: P2PService,
        BS: BlockchainService,
    {
        if !security_context.has_permission("node", "broadcast") {
            return Ok(HttpResponse::Forbidden().json(ApiResponse::<()>::error(
                "Insufficient permissions".to_string(),
            )));
        }

        let broadcast_msg = BroadcastMessage::new(
            req.message.clone(),
            req.priority.unwrap_or(SyncPriority::Normal),
            security_context.classification.clone(),
        );

        state.blockchain_service.broadcast_message(&broadcast_msg, &security_context)
            .await
            .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

        Ok(HttpResponse::Ok().json(ApiResponse::success("Message broadcasted")))
    }

    /// Synchronization Handlers

    pub async fn initiate_sync<DB, SEC, AV, AL, SM, MS, PS, BS>(
        state: web::Data<AppState<DB, SEC, AV, AL, SM, MS, PS, BS>>,
        req: web::Json<SyncRequest>,
        security_context: web::ReqData<SecurityContext>,
    ) -> Result<HttpResponse, Error>
    where
        DB: DatabaseService,
        SEC: SecurityService,
        AV: AssetVerification,
        AL: AuditLogger,
        SM: SyncManager,
        MS: MeshService,
        PS: P2PService,
        BS: BlockchainService,
    {
        // Validate permissions
        if !security_context.has_permission("system", "execute") {
            return Ok(HttpResponse::Forbidden().json(ApiResponse::<()>::error(
                "Insufficient permissions".to_string(),
            )));
        }

        // Schedule sync
        state.sync_manager.schedule_sync(req.into_inner())
            .await
            .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

        Ok(HttpResponse::Accepted().json(ApiResponse::success("Sync initiated")))
    }

    pub async fn sync_status<DB, SEC, AV, AL, SM, MS, PS, BS>(
        state: web::Data<AppState<DB, SEC, AV, AL, SM, MS, PS, BS>>,
        security_context: web::ReqData<SecurityContext>,
    ) -> Result<HttpResponse, Error>
    where
        DB: DatabaseService,
        SEC: SecurityService,
        AV: AssetVerification,
        AL: AuditLogger,
        SM: SyncManager,
        MS: MeshService,
        PS: P2PService,
        BS: BlockchainService,
    {
        // Validate permissions
        if !security_context.has_permission("system", "read") {
            return Ok(HttpResponse::Forbidden().json(ApiResponse::<()>::error(
                "Insufficient permissions".to_string(),
            )));
        }

        // Get sync status
        let status = state.sync_manager.get_status()
            .await
            .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

        Ok(HttpResponse::Ok().json(ApiResponse::success(status)))
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
        Uuid::new_v4(),
        auth_str.to_string(),
        vec![],
        SecurityClassification::Unclassified,
        SecurityLevel::Low,
        SecurityZone::Public,
        SecurityLevel::Low,
    ))
}

pub async fn health_check() -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::success("Service is healthy"))
}
