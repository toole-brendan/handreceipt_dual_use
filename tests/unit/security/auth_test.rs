use backend::mesh::discovery::authenticator::PeerAuthenticator;
use backend::mesh::error::MeshError;

#[cfg(test)]
mod auth_tests {
    use super::*;

    #[test]
    fn test_peer_authentication() {
        let authenticator = PeerAuthenticator::new();
        let peer_id = "PEER_001";
        let credentials = "valid_credentials";
        
        let result = authenticator.authenticate(peer_id, credentials);
        assert!(result.is_ok(), "Authentication should succeed with valid credentials");
    }

    #[test]
    fn test_invalid_credentials() {
        let authenticator = PeerAuthenticator::new();
        let peer_id = "PEER_001";
        let invalid_credentials = "invalid_credentials";
        
        let result = authenticator.authenticate(peer_id, invalid_credentials);
        assert!(result.is_err(), "Authentication should fail with invalid credentials");
    }

    #[test]
    fn test_revoked_peer() {
        let mut authenticator = PeerAuthenticator::new();
        let peer_id = "PEER_001";
        let credentials = "valid_credentials";
        
        // First authenticate the peer
        authenticator.authenticate(peer_id, credentials).unwrap();
        
        // Then revoke access
        authenticator.revoke_peer(peer_id);
        
        // Try to authenticate again
        let result = authenticator.authenticate(peer_id, credentials);
        assert!(result.is_err(), "Revoked peer should not be able to authenticate");
    }
}
