use actix_web::web;
use crate::api::handlers::{property, transfer};

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/mobile")
            .route("/scan-qr", web::post().to(transfer::scan_qr_transfer))
            .route("/sync/{id}", web::get().to(property::get_sync_status))
    );
}
