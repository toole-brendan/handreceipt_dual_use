use actix_web::{web, HttpResponse};
use uuid::Uuid;
use qrcode::QrCode;
use qrcode::render::svg;

use crate::types::{
    app::AppState,
    asset::Asset,
    security::SecurityContext,
};

pub async fn create_asset(
    asset: web::Json<Asset>,
    state: web::Data<AppState>,
    security_context: web::ReqData<SecurityContext>,
) -> HttpResponse {
    match state.infrastructure.update_asset(&asset, &security_context).await {
        Ok(_) => HttpResponse::Created().json(asset.0),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn get_asset(
    id: web::Path<Uuid>,
    state: web::Data<AppState>,
    security_context: web::ReqData<SecurityContext>,
) -> HttpResponse {
    let result = state.infrastructure
        .get_asset(*id, &security_context)
        .await;

    match result {
        Ok(Some(asset)) => HttpResponse::Ok().json(asset),
        Ok(None) => HttpResponse::NotFound().finish(),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn get_asset_qr(
    id: web::Path<Uuid>,
    state: web::Data<AppState>,
    security_context: web::ReqData<SecurityContext>,
) -> HttpResponse {
    let result = state.infrastructure
        .get_asset(*id, &security_context)
        .await;

    match result {
        Ok(Some(asset)) => {
            let qr_data = format!("asset:{}", asset.id);
            let code = QrCode::new(qr_data.as_bytes()).unwrap();
            let svg = code.render()
                .min_dimensions(200, 200)
                .dark_color(svg::Color("#000000"))
                .light_color(svg::Color("#ffffff"))
                .build();

            HttpResponse::Ok()
                .content_type("image/svg+xml")
                .body(svg)
        },
        Ok(None) => HttpResponse::NotFound().finish(),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn update_asset(
    id: web::Path<Uuid>,
    asset: web::Json<Asset>,
    state: web::Data<AppState>,
    security_context: web::ReqData<SecurityContext>,
) -> HttpResponse {
    if *id != asset.id {
        return HttpResponse::BadRequest().body("Asset ID mismatch");
    }

    match state.infrastructure.update_asset(&asset, &security_context).await {
        Ok(_) => HttpResponse::Ok().finish(),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn delete_asset(
    id: web::Path<Uuid>,
    state: web::Data<AppState>,
    security_context: web::ReqData<SecurityContext>,
) -> HttpResponse {
    let result = state.infrastructure
        .get_asset(*id, &security_context)
        .await;

    match result {
        Ok(Some(_)) => {
            // Asset exists, now delete it
            match state.infrastructure.delete_asset(*id, &security_context).await {
                Ok(_) => HttpResponse::NoContent().finish(),
                Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
            }
        },
        Ok(None) => HttpResponse::NotFound().finish(),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn list_assets(
    state: web::Data<AppState>,
    security_context: web::ReqData<SecurityContext>,
) -> HttpResponse {
    match state.infrastructure.list_assets(&security_context).await {
        Ok(assets) => HttpResponse::Ok().json(assets),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn verify_asset_scan(
    id: web::Path<Uuid>,
    state: web::Data<AppState>,
    security_context: web::ReqData<SecurityContext>,
) -> HttpResponse {
    let result = state.infrastructure
        .get_asset(*id, &security_context)
        .await;

    match result {
        Ok(Some(mut asset)) => {
            asset.verify_scan();
            match state.infrastructure.update_asset(&asset, &security_context).await {
                Ok(_) => HttpResponse::Ok().finish(),
                Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
            }
        },
        Ok(None) => HttpResponse::NotFound().finish(),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn scan_rfid_tag(
    id: web::Path<Uuid>,
    state: web::Data<AppState>,
    security_context: web::ReqData<SecurityContext>,
) -> HttpResponse {
    let result = state.infrastructure
        .get_asset(*id, &security_context)
        .await;

    match result {
        Ok(Some(mut asset)) => {
            asset.rfid_last_scanned = Some(chrono::Utc::now());
            match state.infrastructure.update_asset(&asset, &security_context).await {
                Ok(_) => HttpResponse::Ok().finish(),
                Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
            }
        },
        Ok(None) => HttpResponse::NotFound().finish(),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

pub async fn associate_rfid_tag(
    id: web::Path<Uuid>,
    tag_id: web::Json<String>,
    state: web::Data<AppState>,
    security_context: web::ReqData<SecurityContext>,
) -> HttpResponse {
    let result = state.infrastructure
        .get_asset(*id, &security_context)
        .await;

    match result {
        Ok(Some(mut asset)) => {
            asset.rfid_tag_id = Some(tag_id.into_inner());
            match state.infrastructure.update_asset(&asset, &security_context).await {
                Ok(_) => HttpResponse::Ok().finish(),
                Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
            }
        },
        Ok(None) => HttpResponse::NotFound().finish(),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}
