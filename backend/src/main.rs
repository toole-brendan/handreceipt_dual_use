#![allow(proc_macro_derive_resolution_fallback)]

mod api;
mod core;
mod domain;
mod application;
mod infrastructure;
mod error;
mod types;
mod utils;
mod app_builder;

use actix_web::web;
use dotenv::dotenv;
use tracing::{info, Level};
use crate::app_builder::AppBuilder;
use crate::infrastructure::persistence::DatabaseConfig as PersistenceConfig;

fn init_logging() {
    tracing_subscriber::fmt()
        .with_max_level(Level::DEBUG)
        .with_target(false)
        .with_thread_ids(true)
        .with_file(true)
        .with_line_number(true)
        .with_thread_names(true)
        .with_level(true)
        .with_ansi(true)
        .pretty()
        .init();
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    init_logging();

    info!("Starting application with debug logging enabled");

    // Create database config
    let db_config = PersistenceConfig {
        host: std::env::var("DB_HOST").unwrap_or_else(|_| "localhost".to_string()),
        port: std::env::var("DB_PORT").unwrap_or_else(|_| "5432".to_string()).parse().unwrap(),
        username: std::env::var("DB_USER").unwrap_or_else(|_| "postgres".to_string()),
        password: std::env::var("DB_PASSWORD").unwrap_or_else(|_| "postgres".to_string()),
        database: std::env::var("DB_NAME").unwrap_or_else(|_| "handreceipt".to_string()),
        max_connections: std::env::var("DB_MAX_CONNECTIONS")
            .unwrap_or_else(|_| "5".to_string())
            .parse()
            .unwrap(),
    };

    // Get encryption key from environment
    let encryption_key = std::env::var("ENCRYPTION_KEY")
        .unwrap_or_else(|_| "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef".to_string());

    // Build application state
    let app_state = AppBuilder::build(db_config, encryption_key)
        .await
        .expect("Failed to build application state");

    info!("Application state built successfully");
    
    let server = actix_web::HttpServer::new(move || {
        actix_web::App::new()
            .app_data(app_state.clone())
            .configure(api::configure)
    })
    .bind(format!(
        "{}:{}",
        std::env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string()),
        std::env::var("PORT").unwrap_or_else(|_| "8080".to_string())
    ))?
    .workers(std::thread::available_parallelism().map(|n| n.get()).unwrap_or(4))
    .run();

    info!("Starting server...");
    server.await?;
    
    Ok(())
}
