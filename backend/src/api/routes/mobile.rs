use actix_web::{web, HttpResponse, Error};
use std::sync::Arc;

use crate::{
    api::handlers::{
        property,
        transfer,
    },
    types::app::{PropertyService, TransferService},
    domain::models::qr::QRCodeService,
};

/// Configures mobile-specific routes
pub fn configure(cfg: &mut web::ServiceConfig) {
    // Configure mobile-specific routes
    cfg.service(
        web::scope("/mobile")
            // QR scanning
            .route("/scan", web::post().to(transfer::scan_qr_transfer))
            
            // Property lookup
            .route(
                "/property/{id}",
                web::get().to(property::get_property),
            )
            
            // Sync status
            .route("/sync/{id}", web::get().to(property::get_sync_status)),
    );
}
