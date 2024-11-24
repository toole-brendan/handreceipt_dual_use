use std::sync::Arc;
use async_trait::async_trait;
use uuid::Uuid;
use chrono::{DateTime, Utc};

use crate::{
    domain::models::qr::{
        QRCodeService,
        QRFormat,
        QRData,
        QRResponse,
        VerifyQRRequest,
    },
    error::CoreError,
    types::security::SecurityContext,
};

pub struct PropertyQRService {
    qr_service: Arc<dyn QRCodeService>,
}

impl PropertyQRService {
    pub fn new(qr_service: Arc<dyn QRCodeService>) -> Self {
        Self { qr_service }
    }

    async fn check_qr_permissions(&self, context: &SecurityContext) -> Result<(), CoreError> {
        // Officers and NCOs can generate QR codes
        if !context.is_officer() && !context.is_nco() {
            return Err(CoreError::Authorization(
                "Only Officers and NCOs can generate QR codes".into()
            ));
        }
        Ok(())
    }

    async fn check_scan_permissions(&self, context: &SecurityContext) -> Result<(), CoreError> {
        // All users can scan QR codes
        Ok(())
    }

    async fn validate_location(
        &self,
        location: Option<&str>,
        context: &SecurityContext,
    ) -> Result<(), CoreError> {
        if let Some(loc) = location {
            // Verify the location is within the user's command
            if !context.can_access_location(loc) {
                return Err(CoreError::Authorization(
                    "Cannot scan QR codes at this location".into()
                ));
            }
        }
        Ok(())
    }
}

#[async_trait]
impl QRCodeService for PropertyQRService {
    async fn generate_qr(
        &self,
        data: &QRData,
        format: QRFormat,
        context: &SecurityContext,
    ) -> Result<QRResponse, CoreError> {
        // Check permissions
        self.check_qr_permissions(context).await?;

        // Generate QR code using underlying service
        self.qr_service.generate_qr(data, format, context).await
    }

    async fn validate_qr(
        &self,
        request: VerifyQRRequest,
        context: &SecurityContext,
    ) -> Result<QRData, CoreError> {
        // Check permissions
        self.check_scan_permissions(context).await?;

        // Validate location if provided
        self.validate_location(request.location.as_deref(), context).await?;

        // Validate QR code using underlying service
        self.qr_service.validate_qr(request, context).await
    }
}
