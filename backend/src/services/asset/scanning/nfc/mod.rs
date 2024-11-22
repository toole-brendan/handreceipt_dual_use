pub mod communicator;
pub mod validator;

pub use self::communicator::NFCCommunicator;
pub use self::validator::NFCValidator;

use async_trait::async_trait;
