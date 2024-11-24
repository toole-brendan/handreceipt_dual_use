//! API route configuration

use actix_web::web;

pub mod property;
pub mod transfer;
pub mod user;
pub mod mobile;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/v1")
            .configure(property::configure)
            .configure(transfer::configure)
            .configure(user::configure)
            .configure(mobile::configure)
    );
}
