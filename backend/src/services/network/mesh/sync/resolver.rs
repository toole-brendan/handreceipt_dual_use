use std::collections::HashMap;
use crate::types::sync::{
    Change, ChangeOperation, ChangeSet,
    Resolution, ResolutionStrategy,
};

pub struct ConflictResolver {
    resolution_strategies: HashMap<String, ResolutionStrategy>,
}

impl ConflictResolver {
    pub fn new() -> Self {
        let mut strategies = HashMap::new();
        strategies.insert("default".to_string(), ResolutionStrategy::LastWriteWins);
        
        Self {
            resolution_strategies: strategies,
        }
    }

    pub fn add_strategy(&mut self, resource_type: String, strategy: ResolutionStrategy) {
        self.resolution_strategies.insert(resource_type, strategy);
    }

    pub async fn resolve_conflicts(&self, local: &Change, remote: &Change) -> Resolution {
        let strategy = self.resolution_strategies
            .get(&local.resource_id)
            .unwrap_or_else(|| self.resolution_strategies.get("default").unwrap());

        match strategy {
            ResolutionStrategy::LastWriteWins => {
                if local.version >= remote.version {
                    Resolution::Accept(local.clone())
                } else {
                    Resolution::Accept(remote.clone())
                }
            },
            ResolutionStrategy::MergeChanges => {
                Resolution::Merge(self.merge_changes(local, remote))
            },
            ResolutionStrategy::RequireManual => {
                Resolution::Reject
            },
            ResolutionStrategy::Custom(resolver) => {
                resolver(local, remote)
            },
        }
    }

    fn merge_changes(&self, local: &Change, remote: &Change) -> Change {
        match local.operation {
            ChangeOperation::Create => {
                // For create operations, prefer the newer version
                if local.version > remote.version {
                    local.clone()
                } else {
                    remote.clone()
                }
            },
            ChangeOperation::Update => {
                // For updates, merge the data if possible
                let mut merged_data = local.data.clone();
                if let (Some(local_obj), Some(remote_obj)) = (local.data.as_object(), remote.data.as_object()) {
                    for (key, value) in remote_obj {
                        if !local_obj.contains_key(key) {
                            if let Some(obj) = merged_data.as_object_mut() {
                                obj.insert(key.clone(), value.clone());
                            }
                        }
                    }
                }

                Change::new(
                    local.resource_id.clone(),
                    ChangeOperation::Update,
                    merged_data,
                )
                .with_version(std::cmp::max(local.version, remote.version) + 1)
                .with_metadata(local.metadata.clone().unwrap_or_default())
            },
            ChangeOperation::Delete => {
                // For deletes, prefer the delete operation
                if local.operation == ChangeOperation::Delete {
                    local.clone()
                } else {
                    remote.clone()
                }
            },
            ChangeOperation::Merge => {
                // For merge operations, combine metadata and use higher version
                let mut merged = local.clone();
                if let (Some(local_meta), Some(remote_meta)) = (&local.metadata, &remote.metadata) {
                    let mut combined_meta = local_meta.clone();
                    combined_meta.extend(remote_meta.clone());
                    merged = merged.with_metadata(combined_meta);
                }
                merged.with_version(std::cmp::max(local.version, remote.version) + 1)
            },
        }
    }
}
