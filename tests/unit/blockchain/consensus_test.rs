use backend::blockchain::consensus::{mechanism::ConsensusMechanism, validator::Validator};
use backend::mesh::error::MeshError;
use crate::common::helpers;

#[cfg(test)]
mod consensus_tests {
    use super::*;

    #[test]
    fn test_consensus_validation() {
        let validator = Validator::new();
        let test_block = create_test_block();
        
        let result = validator.validate_block(&test_block);
        assert!(result.is_ok(), "Valid block should pass consensus validation");
    }

    #[test]
    fn test_invalid_block_rejection() {
        let validator = Validator::new();
        let mut invalid_block = create_test_block();
        invalid_block.timestamp = 0; // Invalid timestamp
        
        let result = validator.validate_block(&invalid_block);
        assert!(result.is_err(), "Invalid block should be rejected");
    }

    #[test]
    fn test_consensus_mechanism() {
        let mechanism = ConsensusMechanism::new();
        let nodes = create_test_nodes(5);
        let block = create_test_block();
        
        let consensus_reached = mechanism.reach_consensus(&nodes, &block);
        assert!(consensus_reached, "Consensus should be reached with valid nodes");
    }

    // Helper functions
    fn create_test_block() -> Block {
        Block {
            id: "test_block_1".to_string(),
            timestamp: chrono::Utc::now().timestamp(),
            data: vec![1, 2, 3],
            previous_hash: "previous_hash".to_string(),
        }
    }

    fn create_test_nodes(count: u32) -> Vec<Node> {
        (0..count)
            .map(|i| Node::new(format!("node_{}", i)))
            .collect()
    }
}
