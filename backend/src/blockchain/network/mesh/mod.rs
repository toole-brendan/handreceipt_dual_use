// backend/src/blockchain/network/mesh/mod.rs

pub mod bluetooth;
pub mod wifi_direct;

use std::error::Error;
use async_trait::async_trait;

#[async_trait]
pub trait MeshNetwork {
    async fn connect(&mut self) -> Result<(), Box<dyn Error + Send + Sync>>;
    async fn disconnect(&mut self) -> Result<(), Box<dyn Error + Send + Sync>>;
    async fn broadcast(&self, data: &[u8]) -> Result<(), Box<dyn Error + Send + Sync>>;
    async fn receive(&self) -> Result<Vec<u8>, Box<dyn Error + Send + Sync>>;
}

pub use bluetooth::BluetoothMesh;
pub use wifi_direct::WifiDirectMesh;
