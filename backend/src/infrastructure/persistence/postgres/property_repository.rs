use sqlx::PgPool;
use sqlx::types::Json;
use async_trait::async_trait;
use crate::{
    domain::property::entity::{Property, PropertyCategory, PropertyStatus},
    domain::property::repository::PropertyRepository,
    domain::models::location::Location,
    error::RepositoryError,
};

pub struct PgPropertyRepository {
    pool: PgPool,
}

impl PgPropertyRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl PropertyRepository for PgPropertyRepository {
    async fn create_property(&self, property: Property) -> Result<Property, RepositoryError> {
        let record = sqlx::query!(
            r#"
            INSERT INTO properties (
                name, description, category, status, current_holder_id, 
                location, metadata, is_sensitive, quantity, notes,
                serial_number, nsn, hand_receipt_number, requires_approval
            )
            VALUES (
                $1, $2, 
                $3::property_category, 
                $4::property_status, 
                $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
            )
            RETURNING 
                id, name, description, 
                category as "category: PropertyCategory",
                status as "status: PropertyStatus",
                current_holder_id,
                location as "location: Json<Location>",
                metadata as "metadata: Json<serde_json::Value>",
                created_at,
                updated_at,
                is_sensitive,
                quantity,
                notes,
                serial_number,
                nsn,
                hand_receipt_number,
                requires_approval
            "#,
            property.name,
            property.description,
            property.category as PropertyCategory,
            property.status as PropertyStatus,
            property.current_holder_id,
            Json(&property.location) as _,
            Json(&property.metadata) as _,
            property.is_sensitive,
            property.quantity,
            property.notes.as_deref(),
            property.serial_number.as_deref(),
            property.nsn.as_deref(),
            property.hand_receipt_number.as_deref(),
            property.requires_approval
        )
        .fetch_one(&self.pool)
        .await
        .map_err(|e| RepositoryError::Database(e.to_string()))?;

        Ok(Property {
            id: record.id,
            name: record.name,
            description: record.description.unwrap_or_default(),
            category: record.category,
            status: record.status,
            current_holder_id: record.current_holder_id,
            location: record.location.0,
            metadata: record.metadata.0,
            created_at: record.created_at,
            updated_at: record.updated_at,
            is_sensitive: record.is_sensitive,
            quantity: record.quantity,
            notes: record.notes,
            serial_number: record.serial_number,
            nsn: record.nsn,
            hand_receipt_number: record.hand_receipt_number,
            requires_approval: record.requires_approval,
        })
    }

    async fn update_property(&self, property: &Property) -> Result<(), RepositoryError> {
        sqlx::query!(
            r#"
            UPDATE properties
            SET name = $1, 
                description = $2, 
                category = $3::property_category, 
                status = $4::property_status,
                current_holder_id = $5, 
                location = $6, 
                metadata = $7,
                is_sensitive = $8, 
                quantity = $9, 
                notes = $10,
                serial_number = $11, 
                nsn = $12, 
                hand_receipt_number = $13,
                requires_approval = $14, 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $15
            "#,
            property.name,
            property.description,
            property.category as PropertyCategory,
            property.status as PropertyStatus,
            property.current_holder_id,
            Json(&property.location) as _,
            Json(&property.metadata) as _,
            property.is_sensitive,
            property.quantity,
            property.notes.as_deref(),
            property.serial_number.as_deref(),
            property.nsn.as_deref(),
            property.hand_receipt_number.as_deref(),
            property.requires_approval,
            property.id
        )
        .execute(&self.pool)
        .await
        .map_err(|e| RepositoryError::Database(e.to_string()))?;

        Ok(())
    }

    async fn delete_property(&self, id: i32) -> Result<(), RepositoryError> {
        sqlx::query!("DELETE FROM properties WHERE id = $1", id)
            .execute(&self.pool)
            .await
            .map_err(|e| RepositoryError::Database(e.to_string()))?;

        Ok(())
    }

    async fn get_property(&self, id: i32) -> Result<Option<Property>, RepositoryError> {
        let record = sqlx::query!(
            r#"
            SELECT 
                id, name, description, 
                category as "category: PropertyCategory",
                status as "status: PropertyStatus",
                current_holder_id,
                location as "location: Json<Location>",
                metadata as "metadata: Json<serde_json::Value>",
                created_at,
                updated_at,
                is_sensitive,
                quantity,
                notes,
                serial_number,
                nsn,
                hand_receipt_number,
                requires_approval
            FROM properties 
            WHERE id = $1
            "#,
            id
        )
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| RepositoryError::Database(e.to_string()))?;

        Ok(record.map(|r| Property {
            id: r.id,
            name: r.name,
            description: r.description.unwrap_or_default(),
            category: r.category,
            status: r.status,
            current_holder_id: r.current_holder_id,
            location: r.location.0,
            metadata: r.metadata.0,
            created_at: r.created_at,
            updated_at: r.updated_at,
            is_sensitive: r.is_sensitive,
            quantity: r.quantity,
            notes: r.notes,
            serial_number: r.serial_number,
            nsn: r.nsn,
            hand_receipt_number: r.hand_receipt_number,
            requires_approval: r.requires_approval,
        }))
    }

    async fn list_properties(&self) -> Result<Vec<Property>, RepositoryError> {
        let records = sqlx::query!(
            r#"
            SELECT 
                id, name, description, 
                category as "category: PropertyCategory",
                status as "status: PropertyStatus",
                current_holder_id,
                location as "location: Json<Location>",
                metadata as "metadata: Json<serde_json::Value>",
                created_at,
                updated_at,
                is_sensitive,
                quantity,
                notes,
                serial_number,
                nsn,
                hand_receipt_number,
                requires_approval
            FROM properties 
            ORDER BY id
            "#
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| RepositoryError::Database(e.to_string()))?;

        Ok(records.into_iter().map(|r| Property {
            id: r.id,
            name: r.name,
            description: r.description.unwrap_or_default(),
            category: r.category,
            status: r.status,
            current_holder_id: r.current_holder_id,
            location: r.location.0,
            metadata: r.metadata.0,
            created_at: r.created_at,
            updated_at: r.updated_at,
            is_sensitive: r.is_sensitive,
            quantity: r.quantity,
            notes: r.notes,
            serial_number: r.serial_number,
            nsn: r.nsn,
            hand_receipt_number: r.hand_receipt_number,
            requires_approval: r.requires_approval,
        }).collect())
    }
}
