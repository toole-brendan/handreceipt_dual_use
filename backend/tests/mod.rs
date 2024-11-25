#[cfg(test)]
pub fn setup() {
    use env_logger;
    let _ = env_logger::builder()
        .is_test(true)
        .try_init();
}

pub mod common;
pub mod unit;
pub mod integration;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_setup() {
        setup();
    }
}
