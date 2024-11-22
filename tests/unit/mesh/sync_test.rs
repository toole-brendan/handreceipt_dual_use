use backend::mesh::sync::{manager::SyncManager, resolver::ConflictResolver};
use backend::mesh::offline::{storage::OfflineStorage, queue::SyncQueue};
use backend::mesh::error::MeshError;
use crate::common::helpers;

#[cfg(test)]
mod sync_tests {
    use super::*;

    #[test]
    fn test_basic_sync() {
        let sync_manager = SyncManager::new();
        let test_data = create_test_sync_data();
        
        let sync_result = sync_manager.sync_data(test_data.clone());
        assert!(sync_result.is_ok(), "Basic sync should succeed");
        
        let synced_data = sync_manager.get_synced_data();
        assert_eq!(synced_data, test_data, "Synced data should match original");
    }

    #[test]
    fn test_conflict_resolution() {
        let resolver = ConflictResolver::new();
        let (local_data, remote_data) = create_conflicting_data();
        
        let resolved_data = resolver.resolve_conflict(local_data, remote_data)
            .expect("Conflict resolution failed");
            
        assert!(resolved_data.is_consistent(), "Resolved data should be consistent");
    }

    #[test]
    fn test_offline_sync_queue() {
        let queue = SyncQueue::new();
        let storage = OfflineStorage::new();
        let test_operation = create_test_operation();
        
        // Queue offline operation
        queue.add_operation(test_operation.clone())
            .expect("Failed to queue operation");
            
        // Verify operation is stored
        assert!(storage.has_pending_operations());
        
        // Process queue
        let sync_result = queue.process_pending_operations();
        assert!(sync_result.is_ok(), "Queue processing should succeed");
    }

    #[test]
    fn test_sync_recovery() {
        let sync_manager = SyncManager::new();
        let storage = OfflineStorage::new();
        
        // Simulate failed sync
        sync_manager.simulate_sync_failure();
        
        // Attempt recovery
        let recovery_result = sync_manager.recover_failed_sync();
        assert!(recovery_result.is_ok(), "Sync recovery should succeed");
        
        // Verify system state
        assert!(storage.is_consistent(), "Storage should be consistent after recovery");
    }

    // Helper functions
    fn create_test_sync_data() -> SyncData {
        SyncData {
            id: "test_sync_1".to_string(),
            timestamp: chrono::Utc::now().timestamp(),
            payload: vec![1, 2, 3],
        }
    }

    fn create_conflicting_data() -> (SyncData, SyncData) {
        let base_data = create_test_sync_data();
        let conflicting_data = SyncData {
            id: base_data.id.clone(),
            timestamp: base_data.timestamp + 1,
            payload: vec![4, 5, 6],
        };
        (base_data, conflicting_data)
    }

    fn create_test_operation() -> SyncOperation {
        SyncOperation {
            id: "op_1".to_string(),
            operation_type: OperationType::Update,
            data: create_test_sync_data(),
            priority: Priority::High,
        }
    }
}
