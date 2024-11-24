use actix_web::{web, HttpResponse, Error};
use serde::{Serialize, Deserialize};
use uuid::Uuid;
use std::sync::Arc;

use crate::types::user::{Rank, Role, Unit};
use crate::types::security::{
    SecurityContext,
    SecurityClassification,
};
use crate::types::permissions::{Permission, ResourceType, Action};

#[derive(Debug, Serialize)]
pub struct UserProfile {
    pub id: Uuid,
    pub name: String,
    pub rank: Rank,
    pub unit: Unit,
    pub role: Role,
}

#[derive(Debug, Deserialize, Clone)]
pub struct UpdateProfileRequest {
    pub name: Option<String>,
    pub rank: Option<Rank>,
    pub unit: Option<Unit>,
}

/// Gets a user's profile
pub async fn get_user_profile(
    id: web::Path<Uuid>,
    context: web::ReqData<SecurityContext>,
) -> Result<HttpResponse, Error> {
    // Only allow users to view their own profile or officers/NCOs to view profiles in their command
    let user_id = id.into_inner();
    if user_id != context.user_id && !context.can_view_user_profile(user_id) {
        return Err(actix_web::error::ErrorForbidden("Insufficient permissions"));
    }

    // TODO: Implement actual user profile retrieval
    let profile = UserProfile {
        id: user_id,
        name: "John Doe".to_string(),
        rank: Rank::E5,
        unit: Unit {
            name: "1st Battalion".to_string(),
            command_id: Uuid::new_v4(),
        },
        role: Role::Soldier,
    };

    Ok(HttpResponse::Ok().json(profile))
}

/// Updates a user's profile
pub async fn update_user_profile(
    id: web::Path<Uuid>,
    request: web::Json<UpdateProfileRequest>,
    context: web::ReqData<SecurityContext>,
) -> Result<HttpResponse, Error> {
    // Only allow users to update their own profile or officers to update profiles in their command
    let user_id = id.into_inner();
    if user_id != context.user_id && !context.can_update_user_profile(user_id) {
        return Err(actix_web::error::ErrorForbidden("Insufficient permissions"));
    }

    let request = request.into_inner();

    // TODO: Implement actual profile update
    let profile = UserProfile {
        id: user_id,
        name: request.name.unwrap_or_else(|| "John Doe".to_string()),
        rank: request.rank.unwrap_or(Rank::E5),
        unit: request.unit.unwrap_or(Unit {
            name: "1st Battalion".to_string(),
            command_id: Uuid::new_v4(),
        }),
        role: Role::Soldier,
    };

    Ok(HttpResponse::Ok().json(profile))
}

/// Gets users in a command
pub async fn get_command_users(
    _id: web::Path<Uuid>,
    context: web::ReqData<SecurityContext>,
) -> Result<HttpResponse, Error> {
    // Only allow officers/NCOs to view users in their command
    if !context.can_view_command_users() {
        return Err(actix_web::error::ErrorForbidden("Insufficient permissions"));
    }

    // TODO: Implement actual command users retrieval
    let empty_users: Vec<UserProfile> = Vec::new();
    Ok(HttpResponse::Ok().json(empty_users))
}

/// Configures user routes
pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/user")
            .route("/{id}", web::get().to(get_user_profile))
            .route("/{id}", web::put().to(update_user_profile))
            .route("/command/{id}", web::get().to(get_command_users))
    );
}
