use async_trait::async_trait;
use uuid::Uuid;
use std::sync::Arc;

use crate::{
    error::CoreError,
    types::{
        security::SecurityContext,
        app::PropertyService as AppPropertyService,
    },
    domain::property::{
        entity::Property,
        service::DomainPropertyService,
    },
};

pub struct PropertyServiceWrapper<S: DomainPropertyService> {
    inner: S,
}

impl<S: DomainPropertyService> PropertyServiceWrapper<S> {
    pub fn new(service: S) -> Self {
        Self { inner: service }
    }
}

#[async_trait]
impl<S: DomainPropertyService + Send + Sync> AppPropertyService for PropertyServiceWrapper<S> {
    async fn create_property(
        &self,
        property: Property,
        context: &SecurityContext,
    ) -> Result<Property, CoreError> {
        self.inner.create_property(property, context).await
    }

    async fn get_property(
        &self,
        id: Uuid,
        context: &SecurityContext,
    ) -> Result<Option<Property>, CoreError> {
        self.inner.get_property(id, context).await
    }

    async fn update_property(
        &self,
        property: &Property,
        context: &SecurityContext,
    ) -> Result<(), CoreError> {
        self.inner.update_property(property, context).await
    }

    async fn list_properties(
        &self,
        context: &SecurityContext,
    ) -> Result<Vec<Property>, CoreError> {
        self.inner.search(Default::default(), context).await
    }

    async fn delete_property(
        &self,
        id: Uuid,
        context: &SecurityContext,
    ) -> Result<(), CoreError> {
        self.inner.delete_property(id, context).await
    }
}
