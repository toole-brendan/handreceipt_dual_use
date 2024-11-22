use crate::services::core::audit::{AuditEvent, AuditError};
use ring::digest::{Context, SHA256};
use std::collections::HashMap;
use tokio::sync::RwLock;
use std::sync::Arc;
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};

pub struct AuditChain {
    blocks: Arc<RwLock<Vec<AuditBlock>>>,
    pending_events: Arc<RwLock<Vec<AuditEvent>>>,
    block_size: usize,
}

#[derive(Clone, Debug)]
struct AuditBlock {
    index: u64,
    timestamp: i64,
    events: Vec<AuditEvent>,
    previous_hash: String,
    hash: String,
}

impl AuditChain {
    pub fn new() -> Self {
        Self {
            blocks: Arc::new(RwLock::new(vec![AuditBlock::genesis()])),
            pending_events: Arc::new(RwLock::new(Vec::new())),
            block_size: 100, // Default number of events per block
        }
    }

    pub async fn add_event(&self, event: AuditEvent) -> Result<(), AuditError> {
        let mut pending = self.pending_events.write().await;
        pending.push(event);

        if pending.len() >= self.block_size {
            self.create_block().await?;
        }

        Ok(())
    }

    async fn create_block(&self) -> Result<(), AuditError> {
        let mut pending = self.pending_events.write().await;
        let mut blocks = self.blocks.write().await;

        if pending.is_empty() {
            return Ok(());
        }

        let previous_block = blocks.last().ok_or_else(|| {
            AuditError::Storage("Chain is empty".to_string())
        })?;

        let events: Vec<AuditEvent> = pending.drain(..).collect();
        let new_block = AuditBlock::new(
            previous_block.index + 1,
            previous_block.hash.clone(),
            events,
        );

        blocks.push(new_block);
        Ok(())
    }

    pub async fn verify_chain(&self) -> Result<bool, AuditError> {
        let blocks = self.blocks.read().await;
        
        for i in 1..blocks.len() {
            let current = &blocks[i];
            let previous = &blocks[i - 1];

            // Verify block hash matches previous_hash reference
            if current.previous_hash != previous.hash {
                return Ok(false);
            }

            // Verify block hash is valid
            if current.hash != current.calculate_hash() {
                return Ok(false);
            }
        }

        Ok(true)
    }

    pub async fn get_block(&self, index: u64) -> Option<AuditBlock> {
        let blocks = self.blocks.read().await;
        blocks.iter().find(|b| b.index == index).cloned()
    }

    pub fn set_block_size(&mut self, size: usize) {
        self.block_size = size;
    }
}

impl AuditBlock {
    fn genesis() -> Self {
        let mut block = Self {
            index: 0,
            timestamp: chrono::Utc::now().timestamp(),
            events: Vec::new(),
            previous_hash: "0".repeat(64),
            hash: String::new(),
        };
        block.hash = block.calculate_hash();
        block
    }

    fn new(index: u64, previous_hash: String, events: Vec<AuditEvent>) -> Self {
        let mut block = Self {
            index,
            timestamp: chrono::Utc::now().timestamp(),
            events,
            previous_hash,
            hash: String::new(),
        };
        block.hash = block.calculate_hash();
        block
    }

    fn calculate_hash(&self) -> String {
        let mut context = Context::new(&SHA256);
        
        // Add block metadata to hash
        context.update(&self.index.to_be_bytes());
        context.update(&self.timestamp.to_be_bytes());
        context.update(self.previous_hash.as_bytes());

        // Add events to hash
        for event in &self.events {
            context.update(event.id.as_bytes());
            context.update(event.timestamp.timestamp().to_be_bytes());
            context.update(event.event_type.as_bytes());
            context.update(event.action.as_bytes());
            if let Some(user_id) = &event.user_id {
                context.update(user_id.as_bytes());
            }
            if let Some(resource_id) = &event.resource_id {
                context.update(resource_id.as_bytes());
            }
            context.update(&serde_json::to_vec(&event.details).unwrap_or_default());
        }

        let digest = context.finish();
        BASE64.encode(digest.as_ref())
    }
}

impl Default for AuditChain {
    fn default() -> Self {
        Self::new()
    }
}
