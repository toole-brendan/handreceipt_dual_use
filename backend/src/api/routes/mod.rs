use actix_web::web;
use actix_web::web::ServiceConfig;

pub mod mobile;
pub mod property;
pub mod transfer;
pub mod user;

pub fn configure_routes(cfg: &mut actix_web::web::ServiceConfig) {
    mobile::configure_routes(cfg);
    property::configure_routes(cfg);
    transfer::configure_routes(cfg);
    user::configure_routes(cfg);
}
