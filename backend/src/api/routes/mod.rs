//! API route configuration

use actix_web::web;
use crate::api::handlers::property_handler;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/v1")
            .configure(property_handler::configure)
    );
}
