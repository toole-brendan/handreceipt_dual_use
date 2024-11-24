use actix_web::web;
use std::sync::Arc;

use crate::{
    api::handlers::transfer,
    types::app::{PropertyService, TransferService},
    domain::models::qr::QRCodeService,
    infrastructure::blockchain::verification::BlockchainVerification,
};

/// Configures transfer-related routes
pub fn configure(cfg: &mut web::ServiceConfig) {
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
