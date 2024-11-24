use actix_web::web;
use std::sync::Arc;

use crate::{
    application::{
        property::queries::PropertyQueryService,
        transfer::commands::TransferCommandService,
    },
    domain::models::qr::QRCodeService,
};

use super::super::handlers::mobile;

/// Configures mobile-specific routes
pub fn configure(cfg: &mut web::ServiceConfig) {
    // Register services
    let property_service = Arc::new(PropertyQueryService::new(
        Arc::new(/* property service */),
    ));

    let transfer_service = Arc::new(TransferCommandService::new(
        Arc::new(/* transfer service */),
        Arc::new(/* property service */),
        Arc::new(/* qr service */),
    ));

    let qr_service = Arc::new(/* qr service impl */);

    // Register data
    cfg.app_data(web::Data::new(property_service.clone()));
    cfg.app_data(web::Data::new(transfer_service.clone()));
    cfg.app_data(web::Data::new(qr_service.clone()));

    // Configure mobile-specific routes
    cfg.service(
        web::scope("/mobile")
            // QR scanning
            .route("/scan", web::post().to(mobile::process_scan))
            
            // Property lookup
            .route(
                "/property/{id}",
                web::get().to(mobile::get_property_summary),
            )
            
            // Sync status
            .route("/sync/{id}", web::get().to(mobile::get_sync_status)),
    );
}
