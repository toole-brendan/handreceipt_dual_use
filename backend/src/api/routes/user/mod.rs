use actix_web::web;
use crate::api::handlers::user;

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/users")
            .route("/{id}", web::get().to(user::get_user))
            .route("/{id}", web::put().to(user::update_user))
    );
}
