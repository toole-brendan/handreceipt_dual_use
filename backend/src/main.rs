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
use crate::infrastructure::persistence::{DatabaseConfig, create_pool};

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

    // Create database config and pool
    let db_config = DatabaseConfig::from_env();
    let pool = create_pool(&db_config)
        .await
        .expect("Failed to create database pool");

    // Build and run the application
    let app_state = AppBuilder::new()
        .with_database(pool)
        .build()
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
