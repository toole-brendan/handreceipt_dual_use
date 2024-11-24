use serde::{Serialize, Deserialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Rank {
    E1, E2, E3, E4, E5, E6, E7, E8, E9,
    O1, O2, O3, O4, O5, O6, O7, O8, O9, O10,
    WO1, WO2, WO3, WO4, WO5,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Unit {
    pub name: String,
    pub command_id: Uuid,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Role {
    Officer,
    NCO,
    Soldier,
    Admin,
} 