use async_trait::async_trait;
use crate::types::{
    app::MeshService,
    error::CoreError,
};

pub mod discovery;
pub mod error;
pub mod offline;
pub mod service;
pub mod sync;

pub struct MeshServiceImpl;

impl MeshServiceImpl {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl MeshService for MeshServiceImpl {
    async fn start(&self) -> Result<(), CoreError> {
        // Initialize mesh networking
        Ok(())
    }

    async fn stop(&self) -> Result<(), CoreError> {
        // Cleanup mesh networking
        Ok(())
    }
}

pub use service::MeshServiceImpl as MeshModule;
