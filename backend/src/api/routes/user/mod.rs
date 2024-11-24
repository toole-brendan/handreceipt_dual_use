use actix_web::web;
use crate::api::handlers::user;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/user")
            .route("/{id}", web::get().to(user::get_user_profile))
            .route("/{id}", web::put().to(user::update_user_profile))
    );
}
