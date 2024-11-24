pub mod entity;
pub mod repository;
pub mod service;

pub use {
    entity::Property,
    repository::PropertyRepository,
    service::PropertyService,
};
