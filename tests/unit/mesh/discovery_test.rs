use backend::mesh::discovery::{peer_scanner::PeerScanner, authenticator::PeerAuthenticator};
use backend::mesh::error::MeshError;
use crate::common::helpers;
use std::time::Duration;

#[cfg(test)]
mod discovery_tests {
    use super::*;

    #[test]
    fn test_peer_scanning() {
        let scanner = PeerScanner::new();
        let scan_duration = Duration::from_secs(5);
        
        let peers = scanner.scan_for_peers(scan_duration)
            .expect("Peer scanning failed");
            
        assert!(!peers.is_empty(), "Should discover at least one peer");
        assert!(peers.iter().all(|p| p.is_valid()), "All peers should be valid");
    }

    #[test]
    fn test_peer_authentication_flow() {
        let scanner = PeerScanner::new();
        let authenticator = PeerAuthenticator::new();
        
        // Find peers
        let peers = scanner.scan_for_peers(Duration::from_secs(2))
            .expect("Peer scanning failed");
            
        // Authenticate first peer
        let test_peer = &peers[0];
        let auth_result = authenticator.authenticate(
            &test_peer.id,
            &helpers::security::generate_test_credentials()
        );
        
        assert!(auth_result.is_ok(), "Peer authentication should succeed");
    }

    #[test]
    fn test_peer_filtering() {
        let scanner = PeerScanner::new();
        let security_level = SecurityLevel::High;
        
        let peers = scanner.scan_for_peers_with_security(security_level)
            .expect("Secure peer scanning failed");
            
        assert!(
            peers.iter().all(|p| p.security_level >= security_level),
            "All peers should meet security requirements"
        );
    }

    #[test]
    fn test_peer_disconnect_handling() {
        let scanner = PeerScanner::new();
        let authenticator = PeerAuthenticator::new();
        
        // Setup peer connection
        let peer = scanner.scan_for_peers(Duration::from_secs(1))
            .expect("Peer scanning failed")[0].clone();
            
        authenticator.authenticate(&peer.id, "valid_creds")
            .expect("Authentication failed");
            
        // Simulate disconnect
        scanner.simulate_peer_disconnect(&peer.id);
        
        // Verify peer is marked as disconnected
        let peer_status = scanner.get_peer_status(&peer.id);
        assert_eq!(peer_status, PeerStatus::Disconnected);
    }
}
