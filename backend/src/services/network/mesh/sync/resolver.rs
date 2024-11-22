use std::collections::HashMap;
use crate::types::sync::{
    Change, ChangeOperation, Resolution, ResolutionStrategy,
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
        let mut merged = local.clone();
        merged.version = std::cmp::max(local.version, remote.version) + 1;
        
        // Merge metadata if present
        if let (Some(local_meta), Some(remote_meta)) = (&local.metadata, &remote.metadata) {
            let mut combined_meta = local_meta.clone();
            combined_meta.extend(remote_meta.clone());
            merged.metadata = Some(combined_meta);
        }

        merged
    }
}
