use serde::{Deserialize, Serialize};

/// Represents different types of resources that can be accessed
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ResourceType {
    Asset,
    User,
    Transfer,
    Audit,
    Security,
    Network,
    Blockchain,
    Scanner,
    MeshNode,
    Transaction,
    Block,
    Node,
    System,
    Replication,
    ReplicationAuthority,
    ManageReplication,
}

/// Represents different actions that can be performed on resources
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum Action {
    Create,
    Read,
    Update,
    Delete,
    Transfer,
    Audit,
    Verify,
    Sign,
    Sync,
    Scan,
    Connect,
    Broadcast,
    Execute,
}

/// Represents a permission to perform an action on a resource
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Permission {
    pub resource: ResourceType,
    pub action: Action,
    pub conditions: Option<serde_json::Value>,
}

impl Permission {
    pub fn new(resource: ResourceType, action: Action) -> Self {
        Self {
            resource,
            action,
            conditions: None,
        }
    }

    pub fn with_conditions(resource: ResourceType, action: Action, conditions: serde_json::Value) -> Self {
        Self {
            resource,
            action,
            conditions: Some(conditions),
        }
    }

    pub fn to_string(&self) -> String {
        format!("{}:{}", self.resource_str(), self.action_str())
    }

    fn resource_str(&self) -> &'static str {
        match self.resource {
            ResourceType::Asset => "asset",
            ResourceType::User => "user",
            ResourceType::Transfer => "transfer",
            ResourceType::Audit => "audit",
            ResourceType::Security => "security",
            ResourceType::Network => "network",
            ResourceType::Blockchain => "blockchain",
            ResourceType::Scanner => "scanner",
            ResourceType::MeshNode => "mesh_node",
            ResourceType::Transaction => "transaction",
            ResourceType::Block => "block",
            ResourceType::Node => "node",
            ResourceType::System => "system",
            ResourceType::Replication => "replication",
            ResourceType::ReplicationAuthority => "replication_authority",
            ResourceType::ManageReplication => "manage_replication",
        }
    }

    fn action_str(&self) -> &'static str {
        match self.action {
            Action::Create => "create",
            Action::Read => "read",
            Action::Update => "update",
            Action::Delete => "delete",
            Action::Transfer => "transfer",
            Action::Audit => "audit",
            Action::Verify => "verify",
            Action::Sign => "sign",
            Action::Sync => "sync",
            Action::Scan => "scan",
            Action::Connect => "connect",
            Action::Broadcast => "broadcast",
            Action::Execute => "execute",
        }
    }
}
