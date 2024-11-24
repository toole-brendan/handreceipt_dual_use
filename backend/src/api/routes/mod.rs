use actix_web::web;
use actix_web::web::ServiceConfig;

pub mod mobile;
pub mod property;
pub mod transfer;
pub mod user;

pub fn configure(cfg: &mut ServiceConfig) {
    cfg
        .service(web::scope("/api/v1")
            .configure(property::configure)
            .configure(mobile::configure)
            .configure(user::configure)
            .configure(transfer::configure));
}
