mod commands;
mod queries;
mod qr;

pub use commands::{PropertyCommands, PropertyCommandsImpl};
pub use queries::{PropertyQueries, PropertyQueriesImpl, PropertyBookSummary};
pub use qr::PropertyQRService;

// Re-export implementation types for dependency injection
pub use commands::PropertyCommandsImpl as DefaultPropertyCommands;
pub use queries::PropertyQueriesImpl as DefaultPropertyQueries;
pub use qr::PropertyQRService as DefaultPropertyQRService;
