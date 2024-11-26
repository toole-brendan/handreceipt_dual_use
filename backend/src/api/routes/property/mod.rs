use actix_web::web;
use crate::api::handlers::property;

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/properties")
            .route("", web::post().to(property::create_property))
            .route("/{id}", web::get().to(property::get_property))
            .route("/{id}", web::put().to(property::update_property))
            .route("/{id}/qr", web::get().to(property::generate_qr))
            .route("/{id}/sync", web::get().to(property::get_sync_status))
    );
} 