use async_trait::async_trait;
use uuid::Uuid;
use std::sync::Arc;

use crate::{
    error::CoreError,
    types::{
        security::SecurityContext,
        app::TransferService as AppTransferService,
    },
    domain::transfer::{
        entity::Transfer,
        service::TransferService,
    },
};

pub struct TransferServiceWrapper<S: TransferService> {
    inner: S,
}

impl<S: TransferService> TransferServiceWrapper<S> {
    pub fn new(service: S) -> Self {
        Self { inner: service }
    }
}

#[async_trait]
impl<S: TransferService + Send + Sync> AppTransferService for TransferServiceWrapper<S> {
    async fn initiate_transfer(
        &self,
        property_id: Uuid,
        new_custodian: String,
        context: &SecurityContext,
    ) -> Result<(), CoreError> {
        self.inner.initiate_transfer(property_id, new_custodian, context).await?;
        Ok(())
    }

    async fn approve_transfer(
        &self,
        transfer_id: Uuid,
        context: &SecurityContext,
    ) -> Result<(), CoreError> {
        self.inner.approve_transfer(transfer_id, context).await?;
        Ok(())
    }

    async fn cancel_transfer(
        &self,
        transfer_id: Uuid,
        context: &SecurityContext,
    ) -> Result<(), CoreError> {
        self.inner.cancel_transfer(transfer_id, context).await?;
        Ok(())
    }

    async fn get_transfer_history(
        &self,
        property_id: Uuid,
        context: &SecurityContext,
    ) -> Result<Vec<Transfer>, CoreError> {
        self.inner.get_property_transfers(property_id, context).await
    }
}
