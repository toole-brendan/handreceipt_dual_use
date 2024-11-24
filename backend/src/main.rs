#![allow(proc_macro_derive_resolution_fallback)]

mod api;
mod core;
mod domain;
mod services;
mod application;
mod infrastructure;
mod error;
mod types;
mod utils;
mod app_builder;

use dotenv::dotenv;
use crate::app_builder::AppBuilder;
use crate::infrastructure::persistence::postgres::PostgresConnection;
use env_logger::{Builder, Env};

fn init_logging() {
    Builder::from_env(Env::default().default_filter_or("debug"))
        .format(|buf, record| {
            use std::io::Write;
            let timestamp = chrono::Local::now().format("%Y-%m-%d %H:%M:%S%.3f");
            writeln!(
                buf,
                "{} [{}] {} - {}:{} - {}",
                timestamp,
                record.level(),
                record.target(),
                record.file().unwrap_or("unknown"),
                record.line().unwrap_or(0),
                record.args()
            )
        })
        .init();
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    init_logging();

    log::info!("Starting application with debug logging enabled");

    // Create database config and pool
    let db_config = DatabaseConfig::new();
    let pool = db_config.create_pool()
        .expect("Failed to create database pool");

    // Build and run the application
    let server = AppBuilder::new()
        .with_database_pool(pool)
        .with_host(std::env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string()))
        .with_port(std::env::var("PORT")
            .unwrap_or_else(|_| "8080".to_string())
            .parse()
            .unwrap_or(8080))
        .with_workers(num_cpus::get())
        .with_websocket_routes()
        .build()?;

    log::info!("Server built successfully");
    
    // Run the server
    log::info!("Starting server...");
    server.await?;
    
    Ok(())
}
