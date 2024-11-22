use super::{StorageModel, StorageResult};

pub trait QueryBuilder {
    fn build_insert<T: StorageModel>(&self, model: &T) -> StorageResult<String>;
    fn build_update<T: StorageModel>(&self, model: &T) -> StorageResult<String>;
    fn build_delete<T: StorageModel>(&self, id: &T::Id) -> StorageResult<String>;
    fn build_select<T: StorageModel>(&self, id: &T::Id) -> StorageResult<String>;
} 