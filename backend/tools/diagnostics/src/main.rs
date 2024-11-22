use anyhow::Result;
use log::info;

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logging
    env_logger::init();
    info!("Starting MATS diagnostics tool...");

    // Run system checks
    check_system()?;

    // Run network diagnostics
    check_network().await?;

    info!("Diagnostics completed successfully");
    Ok(())
}

fn check_system() -> Result<()> {
    let sys = sysinfo::System::new_all();
    
    info!("System Information:");
    info!("Total memory: {} KB", sys.total_memory());
    info!("Used memory: {} KB", sys.used_memory());
    info!("Total swap: {} KB", sys.total_swap());
    info!("Used swap: {} KB", sys.used_swap());

    Ok(())
}

async fn check_network() -> Result<()> {
    info!("Network Diagnostics:");
    
    // Check DNS resolution
    let resolver = trust_dns_resolver::TokioAsyncResolver::tokio_from_system_conf()?;
    let response = resolver.lookup_ip("example.com").await?;
    info!("DNS resolution test: {:?}", response);

    Ok(())
} 