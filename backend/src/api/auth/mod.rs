use actix_web::{
    dev::ServiceRequest,
    error::ErrorUnauthorized,
    http::header,
    web, Error,
};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::future::{ready, Ready};
use uuid::Uuid;
use chrono::{DateTime, Utc, Duration};

/// Military ranks in order of precedence
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum Rank {
    // Officers
    General,
    LieutenantGeneral,
    MajorGeneral,
    BrigadierGeneral,
    Colonel,
    LieutenantColonel,
    Major,
    Captain,
    FirstLieutenant,
    SecondLieutenant,

    // Warrant Officers
    ChiefWarrantOfficer5,
    ChiefWarrantOfficer4,
    ChiefWarrantOfficer3,
    ChiefWarrantOfficer2,
    WarrantOfficer1,

    // Senior NCOs (E-9)
    CommandSergeantMajor,  // CSM - Command level
    SergeantMajor,        // SGM - Staff level

    // Senior NCOs (E-8)
    FirstSergeant,        // 1SG - Company level
    MasterSergeant,       // MSG - Staff level

    // Senior NCOs (E-7)
    SergeantFirstClass,   // SFC

    // Junior NCOs
    StaffSergeant,        // SSG - E-6
    Sergeant,             // SGT - E-5
    Corporal,             // CPL - E-4 (NCO)

    // Junior Enlisted
    Specialist,           // SPC - E-4 (non-NCO)
    PrivateFirstClass,    // PFC - E-3
    PrivateE2,           // PV2 - E-2
    PrivateE1,           // PV1 - E-1
}

impl Rank {
    /// Returns true if this is an officer rank
    pub fn is_officer(&self) -> bool {
        matches!(
            self,
            Rank::General
                | Rank::LieutenantGeneral
                | Rank::MajorGeneral
                | Rank::BrigadierGeneral
                | Rank::Colonel
                | Rank::LieutenantColonel
                | Rank::Major
                | Rank::Captain
                | Rank::FirstLieutenant
                | Rank::SecondLieutenant
        )
    }

    /// Returns true if this is an NCO rank
    pub fn is_nco(&self) -> bool {
        matches!(
            self,
            Rank::CommandSergeantMajor
                | Rank::SergeantMajor
                | Rank::FirstSergeant
                | Rank::MasterSergeant
                | Rank::SergeantFirstClass
                | Rank::StaffSergeant
                | Rank::Sergeant
                | Rank::Corporal
        )
    }

    /// Returns true if this is a senior NCO (E-7 and above)
    pub fn is_senior_nco(&self) -> bool {
        matches!(
            self,
            Rank::CommandSergeantMajor
                | Rank::SergeantMajor
                | Rank::FirstSergeant
                | Rank::MasterSergeant
                | Rank::SergeantFirstClass
        )
    }

    /// Returns true if this rank outranks the other rank
    pub fn outranks(&self, other: &Rank) -> bool {
        // Simple implementation based on enum ordering
        // In a real system, this would be more sophisticated
        *self as u8 <= *other as u8
    }

    /// Gets the pay grade for this rank
    pub fn pay_grade(&self) -> &str {
        match self {
            Rank::General => "O-10",
            Rank::LieutenantGeneral => "O-9",
            Rank::MajorGeneral => "O-8",
            Rank::BrigadierGeneral => "O-7",
            Rank::Colonel => "O-6",
            Rank::LieutenantColonel => "O-5",
            Rank::Major => "O-4",
            Rank::Captain => "O-3",
            Rank::FirstLieutenant => "O-2",
            Rank::SecondLieutenant => "O-1",
            Rank::ChiefWarrantOfficer5 => "W-5",
            Rank::ChiefWarrantOfficer4 => "W-4",
            Rank::ChiefWarrantOfficer3 => "W-3",
            Rank::ChiefWarrantOfficer2 => "W-2",
            Rank::WarrantOfficer1 => "W-1",
            Rank::CommandSergeantMajor | Rank::SergeantMajor => "E-9",
            Rank::FirstSergeant | Rank::MasterSergeant => "E-8",
            Rank::SergeantFirstClass => "E-7",
            Rank::StaffSergeant => "E-6",
            Rank::Sergeant => "E-5",
            Rank::Corporal | Rank::Specialist => "E-4",
            Rank::PrivateFirstClass => "E-3",
            Rank::PrivateE2 => "E-2",
            Rank::PrivateE1 => "E-1",
        }
    }
}

/// User's military unit information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnitInfo {
    pub unit_id: String,      // e.g., "1-1-IN"
    pub parent_unit: Option<String>,
    pub position: String,     // e.g., "Company Commander"
    pub duty_position: Option<String>, // e.g., "Supply Sergeant"
}

/// Claims stored in JWT token
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: Uuid,            // User ID
    pub name: String,         // Full name
    pub rank: Rank,
    pub unit: UnitInfo,
    pub exp: i64,            // Expiration timestamp
    pub iat: i64,            // Issued at timestamp
}

/// User information extracted from token
#[derive(Debug, Clone)]
pub struct AuthInfo {
    pub user_id: Uuid,
    pub name: String,
    pub rank: Rank,
    pub unit: UnitInfo,
}

impl AuthInfo {
    /// Returns true if user is an officer
    pub fn is_officer(&self) -> bool {
        self.rank.is_officer()
    }

    /// Returns true if user is an NCO
    pub fn is_nco(&self) -> bool {
        self.rank.is_nco()
    }

    /// Returns true if user is a senior NCO
    pub fn is_senior_nco(&self) -> bool {
        self.rank.is_senior_nco()
    }

    /// Returns true if user has command authority over a unit
    pub fn has_command_over(&self, unit: &str) -> bool {
        // Check if user's unit is parent of given unit
        if let Some(parent) = &self.unit.parent_unit {
            unit.starts_with(parent)
        } else {
            false
        }
    }

    /// Returns true if user is in supply chain
    pub fn is_supply_chain(&self) -> bool {
        self.unit.duty_position.as_ref()
            .map(|pos| pos.contains("Supply"))
            .unwrap_or(false)
    }
}

/// Authentication configuration
#[derive(Clone)]
pub struct AuthConfig {
    pub jwt_secret: String,
    pub token_expiration: Duration,
}

impl AuthConfig {
    pub fn new(jwt_secret: String, token_expiration: Duration) -> Self {
        Self {
            jwt_secret,
            token_expiration,
        }
    }

    /// Creates a new JWT token
    pub fn create_token(&self, claims: Claims) -> Result<String, jsonwebtoken::errors::Error> {
        encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(self.jwt_secret.as_bytes()),
        )
    }

    /// Validates a JWT token
    pub fn validate_token(&self, token: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
        let validation = Validation::default();
        let key = DecodingKey::from_secret(self.jwt_secret.as_bytes());
        
        let token_data = decode::<Claims>(token, &key, &validation)?;
        Ok(token_data.claims)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rank_hierarchy() {
        assert!(Rank::SergeantMajor.outranks(&Rank::SergeantFirstClass));
        assert!(Rank::FirstSergeant.outranks(&Rank::StaffSergeant));
        assert!(Rank::StaffSergeant.outranks(&Rank::Sergeant));
        assert!(Rank::Sergeant.outranks(&Rank::Corporal));
        assert!(Rank::Corporal.outranks(&Rank::Specialist));
    }

    #[test]
    fn test_nco_identification() {
        assert!(Rank::SergeantMajor.is_nco());
        assert!(Rank::FirstSergeant.is_nco());
        assert!(Rank::SergeantFirstClass.is_nco());
        assert!(Rank::StaffSergeant.is_nco());
        assert!(Rank::Sergeant.is_nco());
        assert!(Rank::Corporal.is_nco());
        assert!(!Rank::Specialist.is_nco());
    }

    #[test]
    fn test_senior_nco_identification() {
        assert!(Rank::SergeantMajor.is_senior_nco());
        assert!(Rank::FirstSergeant.is_senior_nco());
        assert!(Rank::SergeantFirstClass.is_senior_nco());
        assert!(!Rank::StaffSergeant.is_senior_nco());
        assert!(!Rank::Sergeant.is_senior_nco());
    }
}
