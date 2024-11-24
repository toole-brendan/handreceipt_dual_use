use serde::{Serialize, Deserialize};
use std::collections::HashMap;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ResourceType {
    Property,
    Transfer,
    User,
    Command,
    Report,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum Action {
    Create,
    Read,
    Update,
    Delete,
    ViewAll,
    ViewUnit,
    ViewOwn,
    Approve,
    Transfer,
    Generate,
    HandleSensitive,
    ViewCommand,
    UpdateCommand,
    UpdateAll,
    ApproveCommand,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Permission {
    pub resource_type: ResourceType,
    pub action: Action,
    pub constraints: HashMap<String, String>,
}

impl Permission {
    pub fn new(resource_type: ResourceType, action: Action, constraints: HashMap<String, String>) -> Self {
        Self {
            resource_type,
            action,
            constraints,
        }
    }

    pub fn with_constraint(mut self, key: &str, value: &str) -> Self {
        self.constraints.insert(key.to_string(), value.to_string());
        self
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_permission_creation() {
        let permission = Permission::new(ResourceType::Property, Action::ViewAll, HashMap::new())
            .with_constraint("unit", "1-1-IN");

        assert_eq!(permission.resource_type, ResourceType::Property);
        assert_eq!(permission.action, Action::ViewAll);
        assert_eq!(permission.constraints.get("unit").unwrap(), "1-1-IN");
    }
}
