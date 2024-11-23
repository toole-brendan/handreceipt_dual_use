mod entity;
mod repository;
mod service;

// Re-export main types that other modules will need
pub use entity::{
    Property,
    PropertyStatus,
    PropertyCondition,
    Location,
};

pub use repository::{
    PropertyRepository,
    PropertyTransaction,
    PropertySearchCriteria,
    RepositoryError,
};

pub use service::{
    PropertyService,
    PropertyServiceImpl,
    PropertyServiceError,
    CreatePropertyInput,
};

// Expose mock implementations for testing
#[cfg(test)]
pub use repository::mock::MockPropertyRepository;

/// Creates a new property service with the given repository
pub fn new_property_service(
    repository: std::sync::Arc<dyn PropertyRepository>,
) -> impl PropertyService {
    PropertyServiceImpl::new(repository)
}
