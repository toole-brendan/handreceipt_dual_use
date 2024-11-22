// backend/src/handlers/transfer_handlers.rs

use actix_web::{web, HttpResponse, Responder};
use uuid::Uuid;
use log::{error, info};
use serde::{Deserialize, Serialize};
use chrono::Utc;

use crate::models::{
    SignatureType,
    CommandSignature,
    transfer::{AssetTransfer, TransferStatus, VerificationMethod},
};
use crate::services::sync::SyncManager;
use crate::services::security::validation::TransferValidator;
use crate::core::SecurityContext;

#[derive(Debug, Deserialize)]
pub struct InitiateTransferRequest {
    pub asset_id: Uuid,
    pub to_user_id: Uuid,
    pub classification_level: String,
    pub verification_method: VerificationMethod,
    pub transfer_reason: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct TransferResponse {
    pub transfer_id: Uuid,
    pub status: TransferStatus,
    pub timestamp: chrono::DateTime<Utc>,
    pub message: String,
}

pub async fn initiate_transfer(
    request: web::Json<InitiateTransferRequest>,
    peer_sync: web::Data<SyncManager>,
    validator: web::Data<TransferValidator>,
    security_context: web::ReqData<SecurityContext>,
    user_id: Uuid,
) -> impl Responder {
    info!("Initiating transfer for asset: {}", request.asset_id);

    let mut transfer = AssetTransfer::new(
        request.asset_id,
        user_id,
        request.to_user_id,
        Some(request.verification_method.clone()),
        serde_json::json!({
            "classification_level": request.classification_level,
            "transfer_reason": request.transfer_reason,
            "network_conditions": {
                "is_offline": false
            }
        }),
    );

    // Add sender's signature
    transfer.signatures.push(CommandSignature::new(
        user_id,
        SignatureType::Transfer,
        format!("SIGNATURE_{}", Uuid::new_v4()),
        format!("DEVICE_{}", Uuid::new_v4()),
        security_context.classification.clone(),
    ));

    // Add transfer reason if provided
    if let Some(reason) = &request.transfer_reason {
        if let serde_json::Value::Object(ref mut map) = transfer.metadata {
            map.insert("transfer_reason".to_string(), serde_json::Value::String(reason.clone()));
        }
    }

    // Validate the transfer
    if let Err(e) = validator.validate_transfer(&transfer).await {
        error!("Transfer validation failed: {}", e);
        return HttpResponse::BadRequest().json(TransferResponse {
            transfer_id: transfer.id,
            status: TransferStatus::Failed,
            timestamp: Utc::now(),
            message: format!("Validation failed: {}", e),
        });
    }

    // Handle offline mode
    let is_offline = if let Some(conditions) = transfer.metadata.get("network_conditions") {
        conditions.get("is_offline").and_then(|v| v.as_bool()).unwrap_or(false)
    } else {
        false
    };

    if is_offline {
        match peer_sync.queue_transfer(transfer.clone()).await {
            Ok(_) => {
                info!("Transfer queued for offline sync: {}", transfer.id);
                return HttpResponse::Ok().json(TransferResponse {
                    transfer_id: transfer.id,
                    status: TransferStatus::Pending,
                    timestamp: Utc::now(),
                    message: "Transfer queued for offline sync".to_string(),
                });
            }
            Err(e) => {
                error!("Failed to queue transfer: {}", e);
                return HttpResponse::InternalServerError().json(TransferResponse {
                    transfer_id: transfer.id,
                    status: TransferStatus::Failed,
                    timestamp: Utc::now(),
                    message: "Failed to queue transfer".to_string(),
                });
            }
        }
    }

    // Process online transfer
    HttpResponse::Ok().json(TransferResponse {
        transfer_id: transfer.id,
        status: transfer.status,
        timestamp: transfer.timestamp,
        message: "Transfer initiated successfully".to_string(),
    })
}

pub async fn confirm_transfer(
    request: web::Json<ConfirmTransferRequest>,
    peer_sync: web::Data<SyncManager>,
    validator: web::Data<TransferValidator>,
    user_id: Uuid,
) -> impl Responder {
    info!("Confirming transfer: {}", request.transfer_id);

    // Load transfer from sync state if offline
    let transfer = match peer_sync.load_sync_state(user_id).await {
        Ok(Some(state)) => {
            state.pending_updates.iter()
                .find(|u| u.id == request.transfer_id)
                .and_then(|u| serde_json::from_slice::<AssetTransfer>(&u.data).ok())
        }
        _ => None,
    };

    let transfer = match transfer {
        Some(mut t) => {
            // Add confirmation signature
            t.add_signature(
                user_id,
                format!("CONFIRM_SIG_{}", Uuid::new_v4()),
                request.device_id.clone(),
            );
            t
        }
        None => {
            return HttpResponse::NotFound().json(TransferResponse {
                transfer_id: request.transfer_id,
                status: TransferStatus::Failed,
                timestamp: Utc::now(),
                message: "Transfer not found".to_string(),
            });
        }
    };

    // Validate confirmation
    if let Err(e) = validator.validate_confirmation(&transfer, user_id).await {
        error!("Transfer confirmation validation failed: {}", e);
        return HttpResponse::BadRequest().json(TransferResponse {
            transfer_id: transfer.id,
            status: TransferStatus::Failed,
            timestamp: Utc::now(),
            message: format!("Confirmation validation failed: {}", e),
        });
    }

    // Update transfer in sync state
    if let Some(conditions) = transfer.metadata.get("network_conditions") {
        if conditions.get("is_offline").and_then(|v| v.as_bool()).unwrap_or(false) {
            match peer_sync.queue_transfer(transfer.clone()).await {
                Ok(_) => {
                    info!("Confirmation queued for offline sync: {}", transfer.id);
                    return HttpResponse::Ok().json(TransferResponse {
                        transfer_id: transfer.id,
                        status: TransferStatus::Pending,
                        timestamp: Utc::now(),
                        message: "Confirmation queued for offline sync".to_string(),
                    });
                }
                Err(e) => {
                    error!("Failed to queue confirmation: {}", e);
                    return HttpResponse::InternalServerError().json(TransferResponse {
                        transfer_id: transfer.id,
                        status: TransferStatus::Failed,
                        timestamp: Utc::now(),
                        message: "Failed to queue confirmation".to_string(),
                    });
                }
            }
        }
    }

    HttpResponse::Ok().json(TransferResponse {
        transfer_id: request.transfer_id,
        status: TransferStatus::Confirmed,
        timestamp: Utc::now(),
        message: "Transfer confirmed successfully".to_string(),
    })
}

#[derive(Debug, Deserialize)]
pub struct ConfirmTransferRequest {
    pub transfer_id: Uuid,
    pub device_id: String,
}

pub async fn get_transfer_status(
    path: web::Path<GetTransferRequest>,
    peer_sync: web::Data<SyncManager>,
    user_id: Uuid,
) -> impl Responder {
    info!("Fetching transfer status: {}", path.transfer_id);

    // Check offline sync state first
    if let Ok(Some(state)) = peer_sync.load_sync_state(user_id).await {
        if let Some(update) = state.pending_updates.iter().find(|u| u.id == path.transfer_id) {
            if let Ok(transfer) = serde_json::from_slice::<AssetTransfer>(&update.data) {
                return HttpResponse::Ok().json(TransferResponse {
                    transfer_id: transfer.id,
                    status: transfer.status,
                    timestamp: transfer.timestamp,
                    message: format!("Transfer status: {:?}", transfer.status),
                });
            }
        }
    }

    // If not found in offline state, check online status
    // TODO: Implement actual online status retrieval

    HttpResponse::Ok().json(TransferResponse {
        transfer_id: path.transfer_id,
        status: TransferStatus::Pending,
        timestamp: Utc::now(),
        message: "Transfer status retrieved".to_string(),
    })
}

#[derive(Debug, Deserialize)]
pub struct GetTransferRequest {
    pub transfer_id: Uuid,
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::test;

    #[actix_rt::test]
    async fn test_initiate_transfer() {
        // TODO: Add tests
    }

    #[actix_rt::test]
    async fn test_confirm_transfer() {
        // TODO: Add tests
    }
}