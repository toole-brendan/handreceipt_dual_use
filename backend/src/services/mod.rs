pub mod property;
pub mod transfer;

pub use property::PropertyService;
pub use transfer::TransferService;

use crate::domain::{
    property::repository::PropertyRepository,
    transfer::repository::TransferRepository,
};

pub struct Services {
    pub property: PropertyService,
    pub transfer: TransferService,
}

impl Services {
    pub fn new(
        property_repo: Box<dyn PropertyRepository>,
        transfer_repo: Box<dyn TransferRepository>,
    ) -> Self {
        Self {
            property: PropertyService::new(property_repo),
            transfer: TransferService::new(transfer_repo),
        }
    }
}
