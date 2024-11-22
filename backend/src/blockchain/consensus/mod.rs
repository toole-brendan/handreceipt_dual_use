// backend/src/blockchain/consensus/mod.rs

pub mod mechanism;
pub mod validator;

pub use mechanism::{Authority, AuthorityStatus, ConsensusConfig, ProofOfAuthority};
pub use validator::{ChainValidator, DefaultValidator, ValidationError};

// Re-export common types and traits
pub use mechanism::PropertyTransferAuthority;
