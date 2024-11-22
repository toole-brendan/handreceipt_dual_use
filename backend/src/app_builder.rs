// src/app_builder.rs

use std::sync::Arc;
use actix_web::{web, App, HttpServer, HttpResponse, middleware::DefaultHeaders};
use deadpool_postgres::Pool;
use log::{info, debug};
use actix_cors::Cors;
use serde_json::json;

use crate::core::AppState;
use crate::services::{
    security::SecurityModule,
    blockchain::MilitaryBlockchain,
    sync::SyncManager,
    verification::AssetVerification,
    database::DatabaseConnection,
    network::{NetworkService, NetworkConfig},
    audit::AuditLogger,
    qr_code::QRCodeService,
    rfid::{RFIDServiceImpl, RFIDReaderConfig, ReaderType},
};
use crate::handlers::asset_handlers;

type AppServer = actix_web::dev::Server;

pub struct AppBuilder {
    pool: Option<Pool>,
    host: String,
    port: u16,
    workers: usize,
    config: AppConfig,
}

#[derive(Default)]
struct AppConfig {
    websocket_enabled: bool,
}

impl AppBuilder {
    pub fn new() -> Self {
        debug!("Creating new AppBuilder instance");
        Self {
            pool: None,
            host: "127.0.0.1".to_string(),
            port: 8080,
            workers: num_cpus::get(),
            config: AppConfig::default(),
        }
    }

    pub fn with_database_pool(mut self, pool: Pool) -> Self {
        debug!("Setting database pool");
        self.pool = Some(pool);
        self
    }

    pub fn with_host(mut self, host: String) -> Self {
        debug!("Setting host to: {}", host);
        self.host = host;
        self
    }

    pub fn with_port(mut self, port: u16) -> Self {
        debug!("Setting port to: {}", port);
        self.port = port;
        self
    }

    pub fn with_workers(mut self, workers: usize) -> Self {
        debug!("Setting worker count to: {}", workers);
        self.workers = workers;
        self
    }

    pub fn with_websocket_routes(mut self) -> Self {
        self.config.websocket_enabled = true;
        self
    }

    fn build_state(&self) -> AppState {
        debug!("Building application state");
        let pool = Arc::new(self.pool.clone().expect("Database pool must be configured"));
        
        let security = Arc::new(SecurityModule::new());
        let network = Arc::new(NetworkService::new(
            security.clone(),
            NetworkConfig {
                request_timeout: 30,
                retry_attempts: 3,
                retry_delay_ms: 1000,
                max_concurrent_requests: 10,
            },
        ));
        let blockchain = Arc::new(MilitaryBlockchain::new(security.clone(), network.clone()));
        let sync_manager = Arc::new(SyncManager::new(security.clone()));
        let asset_verification = Arc::new(AssetVerification::new(security.clone()));
        let database = Arc::new(DatabaseConnection::new(
            pool.clone(),
            security.clone(),
        ));
        let audit_logger = Arc::new(AuditLogger::new(pool));
        let qr_service = Arc::new(QRCodeService::new("https://api.example.com".to_string()));

        let rfid_config = RFIDReaderConfig {
            reader_type: ReaderType::UHF,
            frequency: 915,
            power_level: 30,
        };
        let rfid_service = Arc::new(RFIDServiceImpl::new(rfid_config));

        AppState {
            security,
            blockchain,
            sync_manager,
            asset_verification,
            database,
            audit_logger,
            qr_service,
            rfid_service,
        }
    }

    pub fn build(self) -> std::io::Result<AppServer> {
        info!("Building application server");
        let state = web::Data::new(self.build_state());

        let server = HttpServer::new(move || {
            debug!("Configuring new worker instance");
            
            let cors = Cors::default()
                .allow_any_origin()
                .allow_any_method()
                .allow_any_header()
                .max_age(3600);
            
            App::new()
                .app_data(state.clone())
                .wrap(cors)
                .wrap(actix_web::middleware::Logger::default())
                .wrap(crate::middleware::Authentication)
                .service(
                    web::scope("/api")
                        .wrap(DefaultHeaders::new().add(("X-Version", "1.0")))
                        .service(
                            web::resource("/assets")
                                .route(web::post().to(asset_handlers::create_asset))
                                .route(web::get().to(asset_handlers::list_assets))
                        )
                        .service(
                            web::resource("/assets/{id}")
                                .route(web::get().to(asset_handlers::get_asset))
                                .route(web::put().to(asset_handlers::update_asset))
                        )
                        .service(
                            web::resource("/assets/{id}/transfer")
                                .route(web::post().to(asset_handlers::transfer_property))
                        )
                )
                .route("/health", web::get().to(|| async {
                    HttpResponse::Ok().json(json!({ "status": "healthy" }))
                }))
        })
        .bind((self.host.as_str(), self.port))?
        .workers(self.workers);

        info!("Server built successfully");
        Ok(server.run())
    }
} 