use uuid::Uuid;
use std::sync::Arc;

use crate::{
    error::CoreError,
    types::{
        app::PropertyService,
        security::SecurityContext,
    },
    domain::property::entity::Property,
};

pub struct PropertyQueries {
    property_service: Arc<dyn PropertyService>,
}

impl PropertyQueries {
    pub fn new(property_service: Arc<dyn PropertyService>) -> Self {
        Self { property_service }
    }

    pub async fn get_property(
        &self,
        id: Uuid,
        context: &SecurityContext,
    ) -> Result<Option<Property>, CoreError> {
        self.property_service.get_property(id, context).await
    }

    pub async fn list_properties(
        &self,
        context: &SecurityContext,
    ) -> Result<Vec<Property>, CoreError> {
        self.property_service.list_properties(context).await
    }
}
