use std::sync::Arc;
use uuid::Uuid;
use chrono::{Utc, Duration};
use serde_json::json;

use crate::{
    services::{
        network::mesh::offline::{
            storage::OfflineStorage,
            queue::QueueManager,
        },
        infrastructure::database::DatabaseService,
    },
    types::{
        sync::{SyncStatus, SyncType, SyncPriority, Change, ChangeOperation},
        mesh::{QueueItem, OfflineData},
        error::MeshError,
        asset::AssetStatus,
    },
};

async fn setup_test_environment() -> (
    Arc<QueueManager>,
    Arc<OfflineStorage>,
    Arc<DatabaseService>,
) {
    let db = Arc::new(DatabaseService::new().await);
    let queue_manager = Arc::new(QueueManager::new(db.clone()));
    let offline_storage = Arc::new(OfflineStorage::new(db.clone()));

    (queue_manager, offline_storage, db)
}

#[tokio::test]
async fn test_offline_sync_queue_management() {
    let (queue_manager, storage, _) = setup_test_environment().await;

    // 1. Create test changes
    let changes = vec![
        create_test_change(SyncPriority::Critical),
        create_test_change(SyncPriority::High),
        create_test_change(SyncPriority::Normal),
    ];

    // 2. Queue changes while offline
    for change in changes {
        queue_manager.queue_change(change).await.unwrap();
    }

    // 3. Verify queue state
    let queue_items = queue_manager.get_pending_items().await.unwrap();
    assert_eq!(queue_items.len(), 3);

    // 4. Test storage functionality
    for item in queue_items {
        storage.store_offline_data(&item.into()).await.unwrap();
    }

    // 5. Verify stored items
    let stored_items = storage.get_all_pending().await.unwrap();
    assert_eq!(stored_items.len(), 3);
}

#[tokio::test]
async fn test_offline_sync_recovery() {
    let (queue_manager, storage, _) = setup_test_environment().await;

    // 1. Create offline changes
    let offline_changes = vec![
        create_test_change(SyncPriority::Critical),
        create_test_change(SyncPriority::Critical),
    ];

    // 2. Queue and store changes
    for change in offline_changes {
        let queue_item = queue_manager.queue_change(change).await.unwrap();
        storage.store_offline_data(&queue_item.into()).await.unwrap();
    }

    // 3. Process offline queue
    let processed = queue_manager.process_pending_items().await.unwrap();
    assert_eq!(processed, 2);

    // 4. Verify storage state
    let remaining_items = storage.get_all_pending().await.unwrap();
    assert_eq!(remaining_items.len(), 0);
}

#[tokio::test]
async fn test_offline_sync_conflict_resolution() {
    let (queue_manager, storage, _) = setup_test_environment().await;

    // 1. Create conflicting changes for same asset
    let asset_id = Uuid::new_v4();
    let change1 = create_test_change_for_asset(asset_id, SyncPriority::Critical);
    let change2 = create_test_change_for_asset(asset_id, SyncPriority::High);

    // 2. Queue conflicting changes
    queue_manager.queue_change(change1.clone()).await.unwrap();
    queue_manager.queue_change(change2.clone()).await.unwrap();

    // 3. Process queue and check resolution
    let processed = queue_manager.process_pending_items().await.unwrap();
    assert_eq!(processed, 2);

    // 4. Verify final state - Critical priority should win
    let final_state = storage.get_latest_for_asset(&asset_id).await.unwrap();
    assert_eq!(final_state.sync_priority, SyncPriority::Critical);
}

fn create_test_change(priority: SyncPriority) -> Change {
    Change {
        id: Uuid::new_v4(),
        resource_id: Uuid::new_v4().to_string(),
        operation: ChangeOperation::Update,
        data: json!({
            "status": AssetStatus::Active,
            "location": {
                "latitude": 37.7749,
                "longitude": -122.4194
            }
        }),
        version: 1,
        timestamp: Utc::now(),
        metadata: Some(json!({
            "priority": priority,
            "test": true
        })),
    }
}

fn create_test_change_for_asset(asset_id: Uuid, priority: SyncPriority) -> Change {
    Change {
        id: Uuid::new_v4(),
        resource_id: asset_id.to_string(),
        operation: ChangeOperation::Update,
        data: json!({
            "status": AssetStatus::Active,
            "location": {
                "latitude": 37.7749,
                "longitude": -122.4194
            }
        }),
        version: 1,
        timestamp: Utc::now(),
        metadata: Some(json!({
            "priority": priority,
            "test": true
        })),
    }
}
