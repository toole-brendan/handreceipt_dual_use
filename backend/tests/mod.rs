pub mod common;

#[cfg(test)]
mod integration;
#[cfg(test)]
mod unit;

/// Test configuration
pub fn setup() {
    // Initialize test logging
    let _ = env_logger::builder()
        .filter_level(log::LevelFilter::Debug)
        .is_test(true)
        .try_init();
}
