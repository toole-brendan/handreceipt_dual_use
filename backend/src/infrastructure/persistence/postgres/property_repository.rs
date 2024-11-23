use std::sync::Arc;
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{PgPool, Postgres, Transaction};
use uuid::Uuid;

use crate::domain::property::{
    Property,
    PropertyStatus,
    PropertyCondition,
    PropertyCategory,
    Location,
    Verification,
    VerificationMethod,
    PropertyRepository,
    PropertyTransaction,
    PropertySearchCriteria,
    RepositoryError,
};

/// PostgreSQL implementation of PropertyRepository
pub struct PostgresPropertyRepository {
    pool: Arc<PgPool>,
}

impl PostgresPropertyRepository {
    pub fn new(pool: Arc<PgPool>) -> Self {
        Self { pool }
    }

    /// Maps database errors to repository errors
    fn map_error(&self, error: sqlx::Error) -> RepositoryError {
        match error {
            sqlx::Error::RowNotFound => RepositoryError::NotFound,
            sqlx::Error::Database(db_error) => {
                if db_error.is_unique_violation() {
                    RepositoryError::Validation("Duplicate entry".to_string())
                } else {
                    RepositoryError::Storage(db_error.to_string())
                }
            }
            _ => RepositoryError::Storage(error.to_string()),
        }
    }

    /// Converts a database row to a Property entity
    async fn row_to_property(&self, row: sqlx::postgres::PgRow) -> Result<Property, RepositoryError> {
        let id: Uuid = row.try_get("id")?;
        let name: String = row.try_get("name")?;
        let description: String = row.try_get("description")?;
        let category: String = row.try_get("category")?;
        let is_sensitive: bool = row.try_get("is_sensitive")?;
        let quantity: i32 = row.try_get("quantity")?;
        let unit_of_issue: String = row.try_get("unit_of_issue")?;

        // Parse category
        let category = match category.as_str() {
            "WEAPONS" => PropertyCategory::Weapons,
            "ELECTRONICS" => PropertyCategory::Electronics,
            "EQUIPMENT" => PropertyCategory::Equipment,
            "SUPPLIES" => PropertyCategory::Supplies,
            "VEHICLES" => PropertyCategory::Vehicles,
            _ => PropertyCategory::Other,
        };

        // Create base property
        let mut property = Property::new(
            name,
            description,
            category,
            is_sensitive,
            quantity,
            unit_of_issue,
        ).map_err(|e| RepositoryError::Storage(e))?;

        // Set status
        let status: String = row.try_get("status")?;
        let status = match status.as_str() {
            "AVAILABLE" => PropertyStatus::Available,
            "ASSIGNED" => PropertyStatus::Assigned,
            "IN_TRANSIT" => PropertyStatus::InTransit,
            "MAINTENANCE" => PropertyStatus::Maintenance,
            "ARCHIVED" => PropertyStatus::Archived,
            "DISPOSED" => PropertyStatus::Disposed,
            _ => return Err(RepositoryError::Storage("Invalid status".to_string())),
        };
        property.change_status(status);

        // Set condition
        let condition: String = row.try_get("condition")?;
        let condition = match condition.as_str() {
            "SERVICEABLE" => PropertyCondition::Serviceable,
            "UNSERVICEABLE" => PropertyCondition::Unserviceable,
            "NEEDS_REPAIR" => PropertyCondition::NeedsRepair,
            _ => PropertyCondition::Unknown,
        };
        property.update_condition(condition);

        // Set optional fields
        if let Ok(nsn) = row.try_get("nsn") {
            property.set_nsn(nsn);
        }
        if let Ok(serial) = row.try_get("serial_number") {
            property.set_serial_number(serial);
        }
        if let Ok(model) = row.try_get("model_number") {
            property.set_model_number(model);
        }
        if let Ok(qr_code) = row.try_get("qr_code") {
            property.set_qr_code(qr_code);
        }

        // Set custody info
        if let Ok(custodian) = row.try_get::<Option<String>, _>("custodian") {
            if let Some(custodian) = custodian {
                let receipt: Option<String> = row.try_get("hand_receipt_number")?;
                property.transfer_custody(custodian, receipt)
                    .map_err(|e| RepositoryError::Storage(e))?;
            }
        }

        // Load metadata
        let metadata = sqlx::query!(
            "SELECT key, value FROM property_metadata WHERE property_id = $1",
            id
        )
        .fetch_all(&*self.pool)
        .await?;

        for row in metadata {
            property.update_metadata(row.key, row.value)
                .map_err(|e| RepositoryError::Storage(e))?;
        }

        // Load verifications
        let verifications = sqlx::query!(
            r#"
            SELECT 
                timestamp, verifier, method, 
                building, room, notes, grid_coordinates,
                condition_code, verification_notes
            FROM property_verifications
            WHERE property_id = $1
            ORDER BY timestamp DESC
            "#,
            id
        )
        .fetch_all(&*self.pool)
        .await?;

        for row in verifications {
            let method = match row.method.as_str() {
                "QR_CODE" => VerificationMethod::QrCode,
                "MANUAL_CHECK" => VerificationMethod::ManualCheck,
                "BLOCKCHAIN" => VerificationMethod::BlockchainVerification,
                _ => continue,
            };

            let condition = match row.condition_code {
                Some(code) => match code.as_str() {
                    "SERVICEABLE" => Some(PropertyCondition::Serviceable),
                    "UNSERVICEABLE" => Some(PropertyCondition::Unserviceable),
                    "NEEDS_REPAIR" => Some(PropertyCondition::NeedsRepair),
                    _ => None,
                },
                None => None,
            };

            let location = if let Some(building) = row.building {
                Some(Location {
                    building,
                    room: row.room,
                    notes: None,
                    grid_coordinates: row.grid_coordinates,
                })
            } else {
                None
            };

            property.verify(Verification {
                timestamp: row.timestamp,
                verifier: row.verifier,
                method,
                location,
                condition_code: condition,
                notes: row.verification_notes,
            }).map_err(|e| RepositoryError::Storage(e))?;
        }

        // Set current location if exists
        if let Ok(Some(building)) = row.try_get::<Option<String>, _>("current_building") {
            let location = Location {
                building,
                room: row.try_get("current_room")?,
                notes: None,
                grid_coordinates: row.try_get("current_grid_coordinates")?,
            };
            property.update_location(location);
        }

        Ok(property)
    }
}

#[async_trait]
impl PropertyRepository for PostgresPropertyRepository {
    async fn create(&self, property: Property) -> Result<Property, RepositoryError> {
        let mut tx = self.pool.begin().await.map_err(|e| self.map_error(e))?;
        
        // Insert main property record
        sqlx::query!(
            r#"
            INSERT INTO property (
                id, name, description, category, status, condition,
                is_sensitive, quantity, unit_of_issue, nsn, serial_number,
                model_number, qr_code, custodian, hand_receipt_number,
                created_at, updated_at, last_inventoried
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            "#,
            property.id(),
            property.name(),
            property.description(),
            property.category().to_string(),
            property.status().to_string(),
            property.condition().to_string(),
            property.is_sensitive(),
            property.quantity(),
            property.unit_of_issue(),
            property.nsn(),
            property.serial_number(),
            property.model_number(),
            property.qr_code(),
            property.custodian(),
            None::<String>, // hand_receipt_number
            Utc::now(),
            Utc::now(),
            None::<DateTime<Utc>>, // last_inventoried
        )
        .execute(&mut tx)
        .await
        .map_err(|e| self.map_error(e))?;

        // Insert metadata
        for (key, value) in property.metadata() {
            sqlx::query!(
                r#"
                INSERT INTO property_metadata (property_id, key, value)
                VALUES ($1, $2, $3)
                "#,
                property.id(),
                key,
                value,
            )
            .execute(&mut tx)
            .await
            .map_err(|e| self.map_error(e))?;
        }

        // Insert current location if present
        if let Some(location) = property.current_location() {
            sqlx::query!(
                r#"
                INSERT INTO property_locations (
                    property_id, building, room, grid_coordinates
                )
                VALUES ($1, $2, $3, $4)
                "#,
                property.id(),
                location.building,
                location.room,
                location.grid_coordinates,
            )
            .execute(&mut tx)
            .await
            .map_err(|e| self.map_error(e))?;
        }

        tx.commit().await.map_err(|e| self.map_error(e))?;

        Ok(property)
    }

    async fn get_by_id(&self, id: Uuid) -> Result<Property, RepositoryError> {
        let row = sqlx::query!(
            r#"
            SELECT p.*, pl.building as current_building, pl.room as current_room,
                   pl.grid_coordinates as current_grid_coordinates
            FROM property p
            LEFT JOIN property_locations pl ON pl.property_id = p.id
            WHERE p.id = $1
            "#,
            id
        )
        .fetch_one(&*self.pool)
        .await
        .map_err(|e| self.map_error(e))?;

        self.row_to_property(row).await
    }

    async fn update(&self, property: Property) -> Result<Property, RepositoryError> {
        let mut tx = self.pool.begin().await.map_err(|e| self.map_error(e))?;

        // Update main property record
        sqlx::query!(
            r#"
            UPDATE property SET
                name = $1,
                description = $2,
                category = $3,
                status = $4,
                condition = $5,
                is_sensitive = $6,
                quantity = $7,
                unit_of_issue = $8,
                nsn = $9,
                serial_number = $10,
                model_number = $11,
                qr_code = $12,
                custodian = $13,
                updated_at = $14
            WHERE id = $15
            "#,
            property.name(),
            property.description(),
            property.category().to_string(),
            property.status().to_string(),
            property.condition().to_string(),
            property.is_sensitive(),
            property.quantity(),
            property.unit_of_issue(),
            property.nsn(),
            property.serial_number(),
            property.model_number(),
            property.qr_code(),
            property.custodian(),
            Utc::now(),
            property.id(),
        )
        .execute(&mut tx)
        .await
        .map_err(|e| self.map_error(e))?;

        // Update location if present
        if let Some(location) = property.current_location() {
            sqlx::query!(
                r#"
                INSERT INTO property_locations (
                    property_id, building, room, grid_coordinates
                )
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (property_id) DO UPDATE SET
                    building = EXCLUDED.building,
                    room = EXCLUDED.room,
                    grid_coordinates = EXCLUDED.grid_coordinates
                "#,
                property.id(),
                location.building,
                location.room,
                location.grid_coordinates,
            )
            .execute(&mut tx)
            .await
            .map_err(|e| self.map_error(e))?;
        }

        tx.commit().await.map_err(|e| self.map_error(e))?;

        Ok(property)
    }

    async fn delete(&self, id: Uuid) -> Result<(), RepositoryError> {
        sqlx::query!("UPDATE property SET status = 'DISPOSED' WHERE id = $1", id)
            .execute(&*self.pool)
            .await
            .map_err(|e| self.map_error(e))?;

        Ok(())
    }

    async fn search(&self, criteria: PropertySearchCriteria) -> Result<Vec<Property>, RepositoryError> {
        let mut query = String::from(
            r#"
            SELECT DISTINCT
                p.*,
                pl.building as current_building,
                pl.room as current_room,
                pl.grid_coordinates as current_grid_coordinates
            FROM property p
            LEFT JOIN property_locations pl ON pl.property_id = p.id
            WHERE 1=1
            "#
        );

        let mut params: Vec<String> = Vec::new();
        let mut param_count = 1;

        if let Some(status) = criteria.status {
            query.push_str(&format!(" AND status = ${}", param_count));
            params.push(status.to_string());
            param_count += 1;
        }

        if let Some(custodian) = criteria.custodian {
            query.push_str(&format!(" AND custodian = ${}", param_count));
            params.push(custodian);
            param_count += 1;
        }

        if let Some(is_sensitive) = criteria.is_sensitive {
            query.push_str(&format!(" AND is_sensitive = ${}", param_count));
            params.push(is_sensitive.to_string());
            param_count += 1;
        }

        // Add pagination
        if let Some(limit) = criteria.limit {
            query.push_str(&format!(" LIMIT ${}", param_count));
            params.push(limit.to_string());
            param_count += 1;
        }

        if let Some(offset) = criteria.offset {
            query.push_str(&format!(" OFFSET ${}", param_count));
            params.push(offset.to_string());
        }

        // Execute query and map results
        let rows = sqlx::query(&query)
            .fetch_all(&*self.pool)
            .await
            .map_err(|e| self.map_error(e))?;

        let mut properties = Vec::new();
        for row in rows {
            properties.push(self.row_to_property(row).await?);
        }

        Ok(properties)
    }

    async fn begin_transaction(&self) -> Result<Box<dyn PropertyTransaction>, RepositoryError> {
        let tx = self.pool.begin().await.map_err(|e| self.map_error(e))?;
        Ok(Box::new(PostgresPropertyTransaction { tx }))
    }
}

/// PostgreSQL implementation of PropertyTransaction
pub struct PostgresPropertyTransaction {
    tx: Transaction<'static, Postgres>,
}

#[async_trait]
impl PropertyTransaction for PostgresPropertyTransaction {
    async fn commit(self: Box<Self>) -> Result<(), RepositoryError> {
        self.tx
            .commit()
            .await
            .map_err(|e| RepositoryError::Storage(e.to_string()))
    }

    async fn rollback(self: Box<Self>) -> Result<(), RepositoryError> {
        self.tx
            .rollback()
            .await
            .map_err(|e| RepositoryError::Storage(e.to_string()))
    }

    async fn create(&mut self, property: Property) -> Result<Property, RepositoryError> {
        // Insert main property record
        sqlx::query!(
            r#"
            INSERT INTO property (
                id, name, description, category, status, condition,
                is_sensitive, quantity, unit_of_issue, nsn, serial_number,
                model_number, qr_code, custodian, hand_receipt_number,
                created_at, updated_at, last_inventoried
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            "#,
            property.id(),
            property.name(),
            property.description(),
            property.category().to_string(),
            property.status().to_string(),
            property.condition().to_string(),
            property.is_sensitive(),
            property.quantity(),
            property.unit_of_issue(),
            property.nsn(),
            property.serial_number(),
            property.model_number(),
            property.qr_code(),
            property.custodian(),
            None::<String>, // hand_receipt_number
            Utc::now(),
            Utc::now(),
            None::<DateTime<Utc>>, // last_inventoried
        )
        .execute(&mut self.tx)
        .await
        .map_err(|e| RepositoryError::Storage(e.to_string()))?;

        Ok(property)
    }

    async fn update(&mut self, property: Property) -> Result<Property, RepositoryError> {
        sqlx::query!(
            r#"
            UPDATE property SET
                name = $1,
                description = $2,
                category = $3,
                status = $4,
                condition = $5,
                is_sensitive = $6,
                quantity = $7,
                unit_of_issue = $8,
                nsn = $9,
                serial_number = $10,
                model_number = $11,
                qr_code = $12,
                custodian = $13,
                updated_at = $14
            WHERE id = $15
            "#,
            property.name(),
            property.description(),
            property.category().to_string(),
            property.status().to_string(),
            property.condition().to_string(),
            property.is_sensitive(),
            property.quantity(),
            property.unit_of_issue(),
            property.nsn(),
            property.serial_number(),
            property.model_number(),
            property.qr_code(),
            property.custodian(),
            Utc::now(),
            property.id(),
        )
        .execute(&mut self.tx)
        .await
        .map_err(|e| RepositoryError::Storage(e.to_string()))?;

        Ok(property)
    }

    async fn delete(&mut self, id: Uuid) -> Result<(), RepositoryError> {
        sqlx::query!("UPDATE property SET status = 'DISPOSED' WHERE id = $1", id)
            .execute(&mut self.tx)
            .await
            .map_err(|e| RepositoryError::Storage(e.to_string()))?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::postgres::PgPoolOptions;
    use std::env;

    async fn create_test_pool() -> Arc<PgPool> {
        let database_url = env::var("DATABASE_URL")
            .expect("DATABASE_URL must be set for tests");
        
        let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect(&database_url)
            .await
            .expect("Failed to create connection pool");

        Arc::new(pool)
    }

    #[sqlx::test]
    async fn test_create_and_get_property() {
        let pool = create_test_pool().await;
        let repository = PostgresPropertyRepository::new(pool);

        let property = Property::new(
            "M4 Carbine".to_string(),
            "5.56mm Rifle".to_string(),
            PropertyCategory::Weapons,
            true,
            1,
            "Each".to_string(),
        ).unwrap();

        // Create property
        let created = repository.create(property.clone()).await.unwrap();
        assert_eq!(created.id(), property.id());
        assert!(created.is_sensitive());

        // Retrieve property
        let retrieved = repository.get_by_id(created.id()).await.unwrap();
        assert_eq!(retrieved.name(), created.name());
        assert!(retrieved.is_sensitive());
    }

    #[sqlx::test]
    async fn test_property_transfer() {
        let pool = create_test_pool().await;
        let repository = PostgresPropertyRepository::new(pool);

        let mut property = Property::new(
            "M4 Carbine".to_string(),
            "5.56mm Rifle".to_string(),
            PropertyCategory::Weapons,
            true,
            1,
            "Each".to_string(),
        ).unwrap();

        // Create property
        property = repository.create(property).await.unwrap();

        // Transfer property
        property.transfer_custody(
            "NEW_SOLDIER".to_string(),
            Some("HR-123".to_string()),
        ).unwrap();
        property = repository.update(property).await.unwrap();

        // Verify transfer
        let retrieved = repository.get_by_id(property.id()).await.unwrap();
        assert_eq!(retrieved.custodian().unwrap(), "NEW_SOLDIER");
        assert_eq!(retrieved.status(), &PropertyStatus::Assigned);
    }
}
