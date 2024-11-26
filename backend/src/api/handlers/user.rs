use actix_web::{web, HttpResponse};
use serde_json::json;
use crate::{
    domain::models::user::{User, UserService},
    types::security::SecurityContext,
    error::api::ApiError,
};
use std::sync::Arc;

pub async fn get_user(
    user_service: web::Data<Arc<dyn UserService>>,
    context: web::ReqData<SecurityContext>,
    id: web::Path<i32>,
) -> Result<HttpResponse, ApiError> {
    // Only allow users to view their own profile or officers/NCOs to view profiles in their command
    let user_id = id.into_inner();
    if user_id != context.user_id && !context.can_view_user_profile(user_id) {
        return Err(ApiError::AuthorizationError("Insufficient permissions".to_string()));
    }

    let user = user_service.get_user(user_id)
        .await
        .map_err(|e| ApiError::InternalError(e.to_string()))?;

    match user {
        Some(u) => Ok(HttpResponse::Ok().json(json!({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "created_at": u.created_at,
            "updated_at": u.updated_at,
        }))),
        None => Ok(HttpResponse::NotFound().finish()),
    }
}

pub async fn update_user(
    user_service: web::Data<Arc<dyn UserService>>,
    context: web::ReqData<SecurityContext>,
    id: web::Path<i32>,
    req: web::Json<UpdateUserRequest>,
) -> Result<HttpResponse, ApiError> {
    // Only allow users to update their own profile or officers to update profiles in their command
    let user_id = id.into_inner();
    if user_id != context.user_id && !context.can_update_user_profile(user_id) {
        return Err(ApiError::AuthorizationError("Insufficient permissions".to_string()));
    }

    let mut user = user_service.get_user(user_id)
        .await
        .map_err(|e| ApiError::InternalError(e.to_string()))?
        .ok_or_else(|| ApiError::NotFound("User not found".to_string()))?;

    // Update fields
    if let Some(ref email) = req.email {
        user.email = email.clone();
    }
    if let Some(ref role) = req.role {
        user.role = role.clone();
    }

    let updated = user_service.update_user(&user)
        .await
        .map_err(|e| ApiError::InternalError(e.to_string()))?;

    Ok(HttpResponse::Ok().json(json!({
        "id": updated.id,
        "username": updated.username,
        "email": updated.email,
        "role": updated.role,
        "created_at": updated.created_at,
        "updated_at": updated.updated_at,
    })))
}

#[derive(Debug, serde::Deserialize)]
pub struct UpdateUserRequest {
    pub email: Option<String>,
    pub role: Option<String>,
}

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/users")
            .route("/{id}", web::get().to(get_user))
            .route("/{id}", web::put().to(update_user))
    );
}
