use chrono::{DateTime, Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use crate::security::access_control::Role;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: i32,  // user id
    pub name: String,
    pub role: Role,
    pub unit: String,
    pub exp: i64,  // expiration time
    pub iat: i64,  // issued at
}

pub struct AuthService {
    encoding_key: EncodingKey,
    decoding_key: DecodingKey,
}

impl AuthService {
    pub fn new(secret: &[u8]) -> Self {
        Self {
            encoding_key: EncodingKey::from_secret(secret),
            decoding_key: DecodingKey::from_secret(secret),
        }
    }

    pub fn create_token(&self, user_id: i32, name: String, role: Role, unit: String) -> Result<String, jsonwebtoken::errors::Error> {
        let now = Utc::now();
        let exp = (now + Duration::hours(24)).timestamp();
        
        let claims = Claims {
            sub: user_id,
            name,
            role,
            unit,
            exp,
            iat: now.timestamp(),
        };

        encode(&Header::default(), &claims, &self.encoding_key)
    }

    pub fn verify_token(&self, token: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
        let validation = Validation::default();
        let token_data = decode::<Claims>(token, &self.decoding_key, &validation)?;
        Ok(token_data.claims)
    }

    pub fn is_token_expired(exp: i64) -> bool {
        exp < Utc::now().timestamp()
    }
} 