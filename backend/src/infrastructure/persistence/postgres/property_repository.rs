use async_trait::async_trait;
use sqlx::{PgPool, Row};
use uuid::Uuid;
use chrono::{DateTime, Utc};

use crate::domain::property::{
    entity::{Property, PropertyCategory, PropertyStatus, PropertyCondition, Location},
    repository::{PropertyRepository, PropertySearchCriteria, RepositoryError, GeoBounds},
};

use crate::domain::models::transfer::PropertyTransfer;

pub struct PostgresPropertyRepository {
    pool: PgPool,
}

impl PostgresPropertyRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    async fn save_location(&self, property_id: Uuid, location: &Location) -> Result<(), RepositoryError> {
        sqlx::query(
            r#"
            INSERT INTO property_locations (
                property_id, latitude, longitude, altitude, accuracy,
                timestamp, building, room, grid_coordinates, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            "#,
        )
        .bind(property_id)
        .bind(location.latitude)
        .bind(location.longitude)
        .bind(location.altitude)
        .bind(location.accuracy)
        .bind(location.timestamp)
        .bind(&location.building)
        .bind(&location.room)
        .bind(&location.grid_coordinates)
        .bind(&location.notes)
        .execute(&self.pool)
        .await
        .map_err(|e| RepositoryError::Storage(e.to_string()))?;

        Ok(())
    }
}

#[async_trait]
impl PropertyRepository for PostgresPropertyRepository {
    async fn create(&self, property: Property) -> Result<Property, RepositoryError> {
        let mut tx = self.pool
            .begin()
            .await
            .map_err(|e| RepositoryError::Storage(e.to_string()))?;

        // Insert main property record
        sqlx::query(
            r#"
            INSERT INTO properties (
                id, name, description, category, status, condition,
                is_sensitive, quantity, unit_of_measure, value,
                nsn, serial_number, model_number, qr_code,
                custodian, hand_receipt_number, sub_hand_receipt_number,
                created_at, updated_at, last_inventoried
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
            )
            "#,
        )
        .bind(property.id())
        .bind(property.name())
        .bind(property.description())
        .bind(format!("{:?}", property.category()))
        .bind(format!("{:?}", property.status()))
        .bind(format!("{:?}", property.condition()))
        .bind(property.is_sensitive())
        .bind(property.quantity())
        .bind(property.unit_of_measure())
        .bind(property.value())
        .bind(property.nsn())
        .bind(property.serial_number())
        .bind(property.model_number())
        .bind(property.qr_code())
        .bind(property.custodian())
        .bind(property.hand_receipt_number())
        .bind(property.sub_hand_receipt_number())
        .bind(Utc::now())
        .bind(Utc::now())
        .bind(Option::<DateTime<Utc>>::None)
        .execute(&mut *tx)
        .await
        .map_err(|e| RepositoryError::Storage(e.to_string()))?;

        // Save location if present
        if let Some(location) = property.current_location() {
            self.save_location(property.id(), location)
                .await
                .map_err(|e| RepositoryError::Storage(e.to_string()))?;
        }

        tx.commit()
            .await
            .map_err(|e| RepositoryError::Storage(e.to_string()))?;

        Ok(property)
    }

    async fn get_by_id(&self, id: Uuid) -> Result<Property, RepositoryError> {
        let row = sqlx::query(
            r#"
            SELECT * FROM properties WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| match e {
            sqlx::Error::RowNotFound => RepositoryError::NotFound,
            _ => RepositoryError::Storage(e.to_string()),
        })?;

        // TODO: Implement property row mapping
        unimplemented!("Property row mapping not implemented")
    }

    async fn update(&self, property: Property) -> Result<Property, RepositoryError> {
        let mut tx = self.pool
            .begin()
            .await
            .map_err(|e| RepositoryError::Storage(e.to_string()))?;

        sqlx::query(
            r#"
            UPDATE properties SET
                name = $1,
                description = $2,
                category = $3,
                status = $4,
                condition = $5,
                is_sensitive = $6,
                quantity = $7,
                unit_of_measure = $8,
                value = $9,
                nsn = $10,
                serial_number = $11,
                model_number = $12,
                qr_code = $13,
                custodian = $14,
                hand_receipt_number = $15,
                sub_hand_receipt_number = $16,
                updated_at = $17
            WHERE id = $18
            "#,
        )
        .bind(property.name())
        .bind(property.description())
        .bind(format!("{:?}", property.category()))
        .bind(format!("{:?}", property.status()))
        .bind(format!("{:?}", property.condition()))
        .bind(property.is_sensitive())
        .bind(property.quantity())
        .bind(property.unit_of_measure())
        .bind(property.value())
        .bind(property.nsn())
        .bind(property.serial_number())
        .bind(property.model_number())
        .bind(property.qr_code())
        .bind(property.custodian())
        .bind(property.hand_receipt_number())
        .bind(property.sub_hand_receipt_number())
        .bind(Utc::now())
        .bind(property.id())
        .execute(&mut *tx)
        .await
        .map_err(|e| RepositoryError::Storage(e.to_string()))?;

        // Update location if present
        if let Some(location) = property.current_location() {
            self.save_location(property.id(), location)
                .await
                .map_err(|e| RepositoryError::Storage(e.to_string()))?;
        }

        tx.commit()
            .await
            .map_err(|e| RepositoryError::Storage(e.to_string()))?;

        Ok(property)
    }

    async fn delete(&self, id: Uuid) -> Result<(), RepositoryError> {
        sqlx::query("DELETE FROM properties WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| RepositoryError::Storage(e.to_string()))?;

        Ok(())
    }

    async fn search(&self, criteria: PropertySearchCriteria) -> Result<Vec<Property>, RepositoryError> {
        let mut query = String::from("SELECT * FROM properties WHERE 1=1");
        let mut params = vec![];

        if let Some(status) = criteria.status {
            query.push_str(" AND status = $1");
            params.push(format!("{:?}", status));
        }

        if let Some(category) = criteria.category {
            query.push_str(" AND category = $2");
            params.push(format!("{:?}", category));
        }

        if let Some(is_sensitive) = criteria.is_sensitive {
            query.push_str(" AND is_sensitive = $3");
            params.push(is_sensitive.to_string());
        }

        // TODO: Implement parameter binding and row mapping
        unimplemented!("Search implementation not complete")
    }

    async fn get_by_custodian(&self, custodian: &str) -> Result<Vec<Property>, RepositoryError> {
        let rows = sqlx::query("SELECT * FROM properties WHERE custodian = $1")
            .bind(custodian)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| RepositoryError::Storage(e.to_string()))?;

        // TODO: Implement row mapping
        unimplemented!("Row mapping not implemented")
    }

    async fn get_by_command(&self, command_id: &str) -> Result<Vec<Property>, RepositoryError> {
        let rows = sqlx::query(
            r#"
            SELECT p.* FROM properties p
            JOIN unit_hierarchy h ON p.unit_code = h.unit_code
            WHERE h.command_id = $1
            "#,
        )
        .bind(command_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| RepositoryError::Storage(e.to_string()))?;

        // TODO: Implement row mapping
        unimplemented!("Row mapping not implemented")
    }

    async fn get_by_status(&self, status: PropertyStatus) -> Result<Vec<Property>, RepositoryError> {
        let rows = sqlx::query("SELECT * FROM properties WHERE status = $1")
            .bind(format!("{:?}", status))
            .fetch_all(&self.pool)
            .await
            .map_err(|e| RepositoryError::Storage(e.to_string()))?;

        // TODO: Implement row mapping
        unimplemented!("Row mapping not implemented")
    }

    async fn get_by_category(&self, category: PropertyCategory) -> Result<Vec<Property>, RepositoryError> {
        let rows = sqlx::query("SELECT * FROM properties WHERE category = $1")
            .bind(format!("{:?}", category))
            .fetch_all(&self.pool)
            .await
            .map_err(|e| RepositoryError::Storage(e.to_string()))?;

        // TODO: Implement row mapping
        unimplemented!("Row mapping not implemented")
    }

    async fn get_by_nsn(&self, nsn: &str) -> Result<Vec<Property>, RepositoryError> {
        let rows = sqlx::query("SELECT * FROM properties WHERE nsn = $1")
            .bind(nsn)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| RepositoryError::Storage(e.to_string()))?;

        // TODO: Implement row mapping
        unimplemented!("Row mapping not implemented")
    }

    async fn get_by_serial_number(&self, serial: &str) -> Result<Vec<Property>, RepositoryError> {
        let rows = sqlx::query("SELECT * FROM properties WHERE serial_number = $1")
            .bind(serial)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| RepositoryError::Storage(e.to_string()))?;

        // TODO: Implement row mapping
        unimplemented!("Row mapping not implemented")
    }

    async fn get_by_hand_receipt(&self, receipt_number: &str) -> Result<Vec<Property>, RepositoryError> {
        let rows = sqlx::query("SELECT * FROM properties WHERE hand_receipt_number = $1")
            .bind(receipt_number)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| RepositoryError::Storage(e.to_string()))?;

        // TODO: Implement row mapping
        unimplemented!("Row mapping not implemented")
    }

    async fn get_by_location(&self, bounds: GeoBounds) -> Result<Vec<Property>, RepositoryError> {
        let rows = sqlx::query(
            r#"
            SELECT p.* FROM properties p
            JOIN property_locations l ON p.id = l.property_id
            WHERE l.latitude BETWEEN $1 AND $2
            AND l.longitude BETWEEN $3 AND $4
            "#,
        )
        .bind(bounds.min_latitude)
        .bind(bounds.max_latitude)
        .bind(bounds.min_longitude)
        .bind(bounds.max_longitude)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| RepositoryError::Storage(e.to_string()))?;

        // TODO: Implement row mapping
        unimplemented!("Row mapping not implemented")
    }

    async fn get_pending_verification(
        &self,
        threshold: chrono::Duration,
        category: Option<PropertyCategory>,
    ) -> Result<Vec<Property>, RepositoryError> {
        let cutoff = Utc::now() - threshold;

        let mut query = String::from(
            r#"
            SELECT * FROM properties
            WHERE last_inventoried < $1 OR last_inventoried IS NULL
            "#,
        );

        if let Some(cat) = category {
            query.push_str(" AND category = $2");
            sqlx::query(&query)
                .bind(cutoff)
                .bind(format!("{:?}", cat))
                .fetch_all(&self.pool)
                .await
                .map_err(|e| RepositoryError::Storage(e.to_string()))?;
        } else {
            sqlx::query(&query)
                .bind(cutoff)
                .fetch_all(&self.pool)
                .await
                .map_err(|e| RepositoryError::Storage(e.to_string()))?;
        };

        // TODO: Implement row mapping
        unimplemented!("Row mapping not implemented")
    }

    async fn get_latest_transfer(&self, property_id: Uuid) -> Result<Option<PropertyTransfer>, RepositoryError> {
        let row = sqlx::query(
            r#"
            SELECT * FROM property_transfers
            WHERE property_id = $1
            ORDER BY timestamp DESC
            LIMIT 1
            "#,
        )
        .bind(property_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| RepositoryError::Storage(e.to_string()))?;

        // TODO: Implement row mapping
        unimplemented!("Row mapping not implemented")
    }

    async fn begin_transaction(&self) -> Result<Box<dyn crate::domain::property::repository::PropertyTransaction>, RepositoryError> {
        let tx = self.pool
            .begin()
            .await
            .map_err(|e| RepositoryError::Storage(e.to_string()))?;

        Ok(Box::new(PostgresPropertyTransaction { tx }))
    }
}

pub struct PostgresPropertyTransaction {
    tx: sqlx::Transaction<'static, sqlx::Postgres>,
}

#[async_trait]
impl crate::domain::property::repository::PropertyTransaction for PostgresPropertyTransaction {
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
        // TODO: Implement transaction-aware create
        unimplemented!("Transaction create not implemented")
    }

    async fn update(&mut self, property: Property) -> Result<Property, RepositoryError> {
        // TODO: Implement transaction-aware update
        unimplemented!("Transaction update not implemented")
    }

    async fn delete(&mut self, id: Uuid) -> Result<(), RepositoryError> {
        // TODO: Implement transaction-aware delete
        unimplemented!("Transaction delete not implemented")
    }
}
