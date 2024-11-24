// QR code functionality has been moved to domain/models/qr.rs
// This file is kept as a placeholder for potential application-specific QR code logic

pub use crate::domain::models::qr::{
    QRCodeService,
    QRCodeServiceImpl,
    QRFormat,
    QRData,
    QRResponse,
    VerifyQRRequest,
};
