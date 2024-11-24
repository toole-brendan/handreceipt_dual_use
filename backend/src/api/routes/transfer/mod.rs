use actix_web::web;
use crate::api::handlers::transfer;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/transfer")
            .route("", web::post().to(transfer::initiate_transfer))
            .route("/{id}/approve", web::post().to(transfer::approve_transfer))
            .route("/{id}/complete", web::post().to(transfer::complete_transfer))
    );
}
