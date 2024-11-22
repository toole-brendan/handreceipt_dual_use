#[derive(Debug, Clone)]
pub enum ResolutionStrategy {
    LastWriteWins,
    MergeChanges,
    RequireManual,
    Custom(Arc<dyn Fn(&Change, &Change) -> Resolution + Send + Sync + std::fmt::Debug>),
} 