use actix_web::{web, HttpResponse, Error};
use serde::{Serialize, Deserialize};
use uuid::Uuid;
use std::sync::Arc;

use crate::types::security::{SecurityContext, Role, Rank, Unit};

#[derive(Debug, Serialize)]
pub struct UserProfile {
    pub id: Uuid,
    pub name: String,
    pub rank: Rank,
    pub unit: Unit,
    pub role: Role,
}

#[derive(Debug, Deserialize)]
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
    if id.as_ref() != &context.user_id && !context.can_view_user_profile(id.as_ref()) {
        return Err(actix_web::error::ErrorForbidden("Insufficient permissions"));
    }

    // TODO: Implement actual user profile retrieval
    let profile = UserProfile {
        id: id.into_inner(),
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
    if id.as_ref() != &context.user_id && !context.can_update_user_profile(id.as_ref()) {
        return Err(actix_web::error::ErrorForbidden("Insufficient permissions"));
    }

    // TODO: Implement actual profile update
    let profile = UserProfile {
        id: id.into_inner(),
        name: request.name.clone().unwrap_or_else(|| "John Doe".to_string()),
        rank: request.rank.unwrap_or(Rank::E5),
        unit: request.unit.clone().unwrap_or(Unit {
            name: "1st Battalion".to_string(),
            command_id: Uuid::new_v4(),
        }),
        role: Role::Soldier,
    };

    Ok(HttpResponse::Ok().json(profile))
}

/// Gets users in a command
pub async fn get_command_users(
    command_id: web::Path<Uuid>,
    context: web::ReqData<SecurityContext>,
) -> Result<HttpResponse, Error> {
    // Only allow officers/NCOs to view users in their command
    if !context.can_view_command_users(command_id.as_ref()) {
        return Err(actix_web::error::ErrorForbidden("Insufficient permissions"));
    }

    // TODO: Implement actual command users retrieval
    let users = vec![
        UserProfile {
            id: Uuid::new_v4(),
            name: "John Doe".to_string(),
            rank: Rank::E5,
            unit: Unit {
                name: "1st Battalion".to_string(),
                command_id: command_id.into_inner(),
            },
            role: Role::Soldier,
        }
    ];

    Ok(HttpResponse::Ok().json(users))
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
