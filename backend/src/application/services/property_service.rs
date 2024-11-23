// Previous imports and code remain the same...

// Add these new imports
use std::fmt::Write;
use chrono::Datelike;

impl PropertyServiceImpl {
    // Previous methods remain the same...

    /// Formats a military-style hand receipt
    fn format_hand_receipt(
        &self,
        custodian: &str,
        properties: &[Property],
        receipt_number: &str,
    ) -> String {
        let now = Utc::now();
        let mut receipt = String::new();

        // Header
        writeln!(&mut receipt, "DEPARTMENT OF THE ARMY").unwrap();
        writeln!(&mut receipt, "HAND RECEIPT/ANNEX NUMBER").unwrap();
        writeln!(&mut receipt, "For use of this form, see DA PAM 710-2-1.").unwrap();
        writeln!(&mut receipt, "").unwrap();
        writeln!(&mut receipt, "HAND RECEIPT NUMBER: {}", receipt_number).unwrap();
        writeln!(&mut receipt, "FROM: Supply Officer").unwrap();
        writeln!(&mut receipt, "TO: {}", custodian).unwrap();
        writeln!(&mut receipt, "END ITEM: Various").unwrap();
        writeln!(&mut receipt, "DATE: {}", now.format("%Y-%m-%d")).unwrap();
        writeln!(&mut receipt, "").unwrap();

        // Column Headers
        writeln!(&mut receipt, "{:-<120}", "").unwrap();
        writeln!(
            &mut receipt,
            "{:<15} {:<12} {:<30} {:<10} {:<15} {:<15} {:<15}",
            "STOCK NUMBER",
            "SERIAL/REG",
            "ITEM DESCRIPTION",
            "QTY",
            "CODE",
            "SEC CLASS",
            "CONDITION"
        ).unwrap();
        writeln!(&mut receipt, "{:-<120}", "").unwrap();

        // Group items by category
        let mut by_category: HashMap<PropertyCategory, Vec<&Property>> = HashMap::new();
        for property in properties {
            by_category.entry(property.category().clone())
                .or_default()
                .push(property);
        }

        // List items by category
        for (category, items) in by_category {
            writeln!(&mut receipt, "\n{:?}", category).unwrap();
            
            for item in items {
                writeln!(
                    &mut receipt,
                    "{:<15} {:<12} {:<30} {:<10} {:<15} {:<15} {:<15}",
                    item.nsn().unwrap_or(&"N/A".to_string()),
                    item.serial_number().unwrap_or(&"N/A".to_string()),
                    item.name(),
                    item.quantity(),
                    item.model_number().unwrap_or(&"N/A".to_string()),
                    if item.is_sensitive() { "SENSITIVE" } else { "NON-SENS" },
                    item.metadata().get("condition").unwrap_or(&"SERVICEABLE".to_string()),
                ).unwrap();

                // Add any special handling instructions for sensitive items
                if item.is_sensitive() {
                    writeln!(&mut receipt, "    ** SENSITIVE ITEM - Special handling required **").unwrap();
                    writeln!(&mut receipt, "    ** Daily inventory required **").unwrap();
                }
            }
        }

        // Footer
        writeln!(&mut receipt, "\n{:-<120}", "").unwrap();
        writeln!(&mut receipt, "CERTIFICATION").unwrap();
        writeln!(&mut receipt, "I acknowledge receipt of the above listed items and assume responsibility under AR 735-5.").unwrap();
        writeln!(&mut receipt, "").unwrap();
        writeln!(&mut receipt, "Signature: _________________________  Date: ______________").unwrap();
        writeln!(&mut receipt, "Printed Name: {}                     Rank: ____________", custodian).unwrap();
        writeln!(&mut receipt, "Unit: ____________________________   Phone: ____________").unwrap();

        receipt
    }
}

#[async_trait]
impl PropertyService for PropertyServiceImpl {
    // Previous methods remain the same...

    async fn update_location(
        &self,
        id: Uuid,
        location: Location,
        verifier: String,
    ) -> Result<Property, PropertyServiceError> {
        let mut transaction = self.repository.begin_transaction().await
            .map_err(PropertyServiceError::Repository)?;

        let mut property = self.repository.get_by_id(id).await
            .map_err(PropertyServiceError::Repository)?;

        // Validate location
        self.validate_location(&location)?;

        // Update location
        property.update_location(location.clone())
            .map_err(|e| PropertyServiceError::Validation(e))?;

        // Add verification record
        property.verify(Verification {
            timestamp: Utc::now(),
            verifier,
            method: VerificationMethod::ManualCheck,
            location: Some(location),
            condition_code: None,
            notes: Some("Location update verification".to_string()),
        }).map_err(|e| PropertyServiceError::Validation(e))?;

        // Save changes
        let property = transaction.update(property).await
            .map_err(PropertyServiceError::Repository)?;
        transaction.commit().await
            .map_err(PropertyServiceError::Repository)?;

        Ok(property)
    }

    async fn verify_property(
        &self,
        property_id: Uuid,
        verification: Verification,
    ) -> Result<Property, PropertyServiceError> {
        let mut transaction = self.repository.begin_transaction().await
            .map_err(PropertyServiceError::Repository)?;

        let mut property = self.repository.get_by_id(property_id).await
            .map_err(PropertyServiceError::Repository)?;

        // Add verification
        property.verify(verification)
            .map_err(|e| PropertyServiceError::Validation(e))?;

        // For sensitive items, update metadata with last verification
        if property.is_sensitive() {
            property.update_metadata(
                "last_sensitive_item_check".to_string(),
                Utc::now().to_rfc3339(),
            ).map_err(|e| PropertyServiceError::Validation(e))?;
        }

        // Save changes
        let property = transaction.update(property).await
            .map_err(PropertyServiceError::Repository)?;
        transaction.commit().await
            .map_err(PropertyServiceError::Repository)?;

        Ok(property)
    }

    async fn get_property_needing_verification(
        &self,
        category: Option<PropertyCategory>,
    ) -> Result<Vec<Property>, PropertyServiceError> {
        let mut all_property = match category {
            Some(cat) => self.repository.get_by_category(cat).await?,
            None => {
                let criteria = PropertySearchCriteria::default();
                self.repository.search(criteria).await?
            }
        };

        // Filter based on verification thresholds
        all_property.retain(|property| {
            let threshold = self.get_verification_threshold(
                property.is_sensitive(),
                property.category(),
            );

            if let Some(last_verification) = property.verifications().last() {
                Utc::now() - last_verification.timestamp > threshold
            } else {
                true // No verifications yet, needs verification
            }
        });

        // Sort by priority (sensitive items first, then by last verification date)
        all_property.sort_by(|a, b| {
            let a_sensitive = a.is_sensitive();
            let b_sensitive = b.is_sensitive();
            
            if a_sensitive != b_sensitive {
                b_sensitive.cmp(&a_sensitive) // Sensitive items first
            } else {
                let a_last = a.verifications().last().map(|v| v.timestamp);
                let b_last = b.verifications().last().map(|v| v.timestamp);
                a_last.cmp(&b_last) // Older verifications first
            }
        });

        Ok(all_property)
    }

    async fn get_property_by_custodian(
        &self,
        custodian: &str,
    ) -> Result<Vec<Property>, PropertyServiceError> {
        self.repository.get_by_custodian(custodian).await
            .map_err(PropertyServiceError::Repository)
    }

    async fn get_sensitive_items_by_custodian(
        &self,
        custodian: &str,
    ) -> Result<Vec<Property>, PropertyServiceError> {
        self.repository.get_sensitive_by_custodian(custodian).await
            .map_err(PropertyServiceError::Repository)
    }

    async fn get_property_by_hand_receipt(
        &self,
        receipt_number: &str,
    ) -> Result<Vec<Property>, PropertyServiceError> {
        self.repository.get_by_hand_receipt(receipt_number).await
            .map_err(PropertyServiceError::Repository)
    }

    async fn get_property_by_nsn(
        &self,
        nsn: &str,
    ) -> Result<Vec<Property>, PropertyServiceError> {
        self.repository.get_by_nsn(nsn).await
            .map_err(PropertyServiceError::Repository)
    }

    async fn get_property_by_serial(
        &self,
        serial: &str,
    ) -> Result<Vec<Property>, PropertyServiceError> {
        self.repository.get_by_serial_number(serial).await
            .map_err(PropertyServiceError::Repository)
    }

    async fn generate_hand_receipt(
        &self,
        custodian: &str,
    ) -> Result<String, PropertyServiceError> {
        let properties = self.repository.get_by_custodian(custodian).await
            .map_err(PropertyServiceError::Repository)?;

        // Generate a unique receipt number
        let receipt_number = format!(
            "HR-{}-{}-{}",
            Utc::now().format("%Y%m%d"),
            custodian.chars().take(3).collect::<String>().to_uppercase(),
            uuid::Uuid::new_v4().to_string().chars().take(8).collect::<String>()
        );

        Ok(self.format_hand_receipt(custodian, &properties, &receipt_number))
    }
}

// Tests remain the same...
