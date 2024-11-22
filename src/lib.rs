// backend/src/lib.rs

pub mod mesh;
pub mod mobile;

pub use mesh::service::MeshService;
pub use mesh::error::MeshError;