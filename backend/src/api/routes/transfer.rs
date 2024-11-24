use actix_web::web;
use std::sync::Arc;

use crate::{
    application::transfer::{
        commands::TransferCommandService,
        validation::TransferValidationService,
    },
    infrastructure::blockchain::verification::BlockchainVerification,
};

use super::super::handlers::transfer;

/// Configures transfer-related routes
pub fn configure(cfg: &mut web::ServiceConfig) {
    // Register services
    let command_service = Arc::new(TransferCommandService::new(
        Arc::new(/* transfer service */),
        Arc::new(/* property service */),
        Arc::new(/* qr service */),
    ));

    let validation_service = Arc::new(TransferValidationService::new(
        Arc::new(/* property service */),
    ));

    let blockchain_service = Arc::new(BlockchainVerification::new(
        Arc::new(/* authority node */),
    ));

    // Register data
    cfg.app_data(web::Data::new(command_service.clone()));
    cfg.app_data(web::Data::new(validation_service.clone()));
    cfg.app_data(web::Data::new(blockchain_service.clone()));

    // Configure routes
    cfg.service(
        web::scope("/transfer")
            // QR code scanning
            .route("/scan", web::post().to(transfer::scan_qr_transfer))
            
            // Transfer approval
            .route("/pending", web::get().to(transfer::get_pending_transfers))
            .route("/{id}/approve", web::post().to(transfer::approve_transfer))
            
            // Transfer status
            .route("/{id}/status", web::get().to(transfer::get_transfer_status))
            
            // Property transfers
            .route(
                "/property/{id}",
                web::get().to(transfer::get_property_transfers),
            ),
    );
}
