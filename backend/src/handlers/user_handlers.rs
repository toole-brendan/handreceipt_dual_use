use actix_web::{web, HttpResponse, Error};
use serde::{Serialize, Deserialize};

use crate::types::{
    app::AppState,
    security::SecurityContext,
};

use crate::api::ApiResponse;

#[derive(Debug, Serialize, Deserialize)]
pub struct UserPreferences {
    theme: String,
    notifications_enabled: bool,
    default_view: String,
    items_per_page: i32,
}

pub async fn get_user_preferences(
    _state: web::Data<AppState>,
    _security_context: web::ReqData<SecurityContext>,
) -> Result<HttpResponse, Error> {
    // For now, return default preferences
    let preferences = UserPreferences {
        theme: "dark".to_string(),
        notifications_enabled: true,
        default_view: "grid".to_string(),
        items_per_page: 25,
    };

    Ok(HttpResponse::Ok().json(ApiResponse::success(preferences)))
}
