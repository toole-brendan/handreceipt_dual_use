use actix_web::web;
use crate::api::handlers::transfer;

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/transfers")
            .route("", web::post().to(transfer::create_transfer))
            .route("/{id}", web::get().to(transfer::get_transfer))
            .route("/{id}/approve", web::post().to(transfer::approve_transfer))
            .route("/scan-qr", web::post().to(transfer::scan_qr_transfer))
            .route("/pending", web::get().to(transfer::get_pending_transfers))
            .route("/{id}/status", web::get().to(transfer::get_transfer_status))
            .route("/property/{property_id}", web::get().to(transfer::get_property_transfers))
    );
}
