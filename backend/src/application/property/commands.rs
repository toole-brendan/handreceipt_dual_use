use uuid::Uuid;
use async_trait::async_trait;

use crate::{
    domain::property::{
        Property,
        PropertyService,
    },
    types::security::SecurityContext,
    error::CoreError,
};

/// Property command handlers
#[async_trait]
pub trait PropertyCommands: Send + Sync {
    /// Creates a new property
    async fn create_property(
        &self,
        name: String,
        description: String,
        category: String,
        is_sensitive: bool,
        quantity: i32,
        unit_of_issue: String,
        context: &SecurityContext,
    ) -> Result<Property, CoreError>;

    /// Updates an existing property
    async fn update_property(
        &self,
        id: Uuid,
        name: Option<String>,
        description: Option<String>,
        category: Option<String>,
        quantity: Option<i32>,
        context: &SecurityContext,
    ) -> Result<Property, CoreError>;

    /// Deletes a property
    async fn delete_property(
        &self,
        id: Uuid,
        context: &SecurityContext,
    ) -> Result<(), CoreError>;

    /// Assigns a property to a custodian
    async fn assign_property(
        &self,
        id: Uuid,
        custodian: String,
        hand_receipt_number: Option<String>,
        context: &SecurityContext,
    ) -> Result<Property, CoreError>;

    /// Generates QR code for a property
    async fn generate_qr_code(
        &self,
        id: Uuid,
        context: &SecurityContext,
    ) -> Result<String, CoreError>;
}

pub struct PropertyCommandsImpl<S: PropertyService> {
    property_service: S,
}

impl<S: PropertyService> PropertyCommandsImpl<S> {
    pub fn new(property_service: S) -> Self {
        Self { property_service }
    }
}

#[async_trait]
impl<S: PropertyService> PropertyCommands for PropertyCommandsImpl<S> {
    async fn create_property(
        &self,
        name: String,
        description: String,
        category: String,
        is_sensitive: bool,
        quantity: i32,
        unit_of_issue: String,
        context: &SecurityContext,
    ) -> Result<Property, CoreError> {
        // Create property through domain service
        self.property_service.create_property(
            name,
            description,
            category,
            is_sensitive,
            quantity,
            unit_of_issue,
            context,
        ).await
    }

    async fn update_property(
        &self,
        id: Uuid,
        name: Option<String>,
        description: Option<String>,
        category: Option<String>,
        quantity: Option<i32>,
        context: &SecurityContext,
    ) -> Result<Property, CoreError> {
        // Update property through domain service
        self.property_service.update_property(
            id,
            name,
            description,
            category,
            quantity,
            context,
        ).await
    }

    async fn delete_property(
        &self,
        id: Uuid,
        context: &SecurityContext,
    ) -> Result<(), CoreError> {
        // Delete property through domain service
        self.property_service.delete_property(id, context).await
    }

    async fn assign_property(
        &self,
        id: Uuid,
        custodian: String,
        hand_receipt_number: Option<String>,
        context: &SecurityContext,
    ) -> Result<Property, CoreError> {
        // Assign property through domain service
        self.property_service.assign_property(
            id,
            custodian,
            hand_receipt_number,
            context,
        ).await
    }

    async fn generate_qr_code(
        &self,
        id: Uuid,
        context: &SecurityContext,
    ) -> Result<String, CoreError> {
        // Generate QR code through domain service
        self.property_service.generate_qr_code(id, context).await
    }
}
