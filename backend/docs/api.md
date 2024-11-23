# HandReceipt API Documentation

## Overview

The HandReceipt API provides endpoints for managing military property using QR codes and blockchain verification. All endpoints require authentication via JWT tokens.

## Authentication

Authentication is handled via JWT tokens in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens include:
- User ID
- Name
- Rank
- Unit
- Role

## Endpoints

### Property Management

#### Create Property

```http
POST /api/v1/property
Authorization: Bearer <token>
Content-Type: application/json

{
    "name": "M4 Carbine",
    "description": "5.56mm Rifle",
    "nsn": "1005-01-231-0973",
    "serial_number": "12345678",
    "model_number": "M4A1",
    "is_sensitive": true,
    "quantity": 1,
    "unit_of_issue": "Each",
    "value": 750.00,
    "location": {
        "building": "Armory",
        "room": "101",
        "grid_coordinates": "12SWJ1234567890"
    }
}
```

Response:
```json
{
    "id": "uuid",
    "name": "M4 Carbine",
    "description": "5.56mm Rifle",
    "nsn": "1005-01-231-0973",
    "serial_number": "12345678",
    "is_sensitive": true,
    "quantity": 1,
    "custodian": null,
    "qr_code": "base64_encoded_svg",
    "status": "AVAILABLE"
}
```

Required Role: Supply Officer or higher

#### Get Property

```http
GET /api/v1/property/{id}
Authorization: Bearer <token>
```

Response:
```json
{
    "id": "uuid",
    "name": "M4 Carbine",
    "description": "5.56mm Rifle",
    "nsn": "1005-01-231-0973",
    "serial_number": "12345678",
    "is_sensitive": true,
    "quantity": 1,
    "custodian": "SGT.DOE",
    "qr_code": "base64_encoded_svg",
    "status": "ASSIGNED",
    "last_verified": "2024-01-01T12:00:00Z",
    "verification_count": 5
}
```

Required Role: Any authenticated user

#### Get My Property

```http
GET /api/v1/property/my
Authorization: Bearer <token>
```

Response:
```json
[
    {
        "id": "uuid",
        "name": "M4 Carbine",
        "description": "5.56mm Rifle",
        "nsn": "1005-01-231-0973",
        "serial_number": "12345678",
        "is_sensitive": true,
        "quantity": 1,
        "status": "ASSIGNED",
        "last_verified": "2024-01-01T12:00:00Z"
    }
]
```

Required Role: Any authenticated user

### Transfer Management

#### Initiate Transfer

```http
POST /api/v1/property/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
    "qr_data": "scanned_qr_code_data",
    "new_custodian": "PFC.SMITH",
    "location": {
        "building": "Barracks",
        "room": "B123"
    },
    "notes": "Initial issue"
}
```

Response:
```json
{
    "transfer_id": "uuid",
    "property_id": "uuid",
    "from_custodian": "SGT.DOE",
    "to_custodian": "PFC.SMITH",
    "status": "PENDING",
    "timestamp": "2024-01-01T12:00:00Z",
    "requires_commander_approval": true,
    "blockchain_verification": null
}
```

Required Role: Any authenticated user

#### Get Transfer Status

```http
GET /api/v1/property/transfer/{id}
Authorization: Bearer <token>
```

Response:
```json
{
    "transfer_id": "uuid",
    "property_id": "uuid",
    "from_custodian": "SGT.DOE",
    "to_custodian": "PFC.SMITH",
    "status": "PENDING_APPROVAL",
    "timestamp": "2024-01-01T12:00:00Z",
    "requires_commander_approval": true,
    "blockchain_verification": null
}
```

Required Role: Any authenticated user

#### Get My Transfers

```http
GET /api/v1/property/transfer/my
Authorization: Bearer <token>
```

Response:
```json
[
    {
        "transfer_id": "uuid",
        "property_id": "uuid",
        "from_custodian": "SGT.DOE",
        "to_custodian": "PFC.SMITH",
        "status": "COMPLETED",
        "timestamp": "2024-01-01T12:00:00Z",
        "blockchain_verification": "hash"
    }
]
```

Required Role: Any authenticated user

#### Approve Transfer (Commander)

```http
POST /api/v1/property/transfer/{id}/approve
Authorization: Bearer <token>
Content-Type: application/json

{
    "notes": "Approved for transfer"
}
```

Response:
```json
{
    "transfer_id": "uuid",
    "property_id": "uuid",
    "from_custodian": "SGT.DOE",
    "to_custodian": "PFC.SMITH",
    "status": "APPROVED",
    "timestamp": "2024-01-01T12:00:00Z",
    "blockchain_verification": "hash"
}
```

Required Role: Commander

#### Cancel Transfer

```http
POST /api/v1/property/transfer/{id}/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
    "reason": "Equipment needed elsewhere"
}
```

Response:
```json
{
    "transfer_id": "uuid",
    "property_id": "uuid",
    "from_custodian": "SGT.DOE",
    "to_custodian": "PFC.SMITH",
    "status": "CANCELLED",
    "timestamp": "2024-01-01T12:00:00Z"
}
```

Required Role: Original custodian or Supply Officer

## Error Responses

All endpoints may return the following errors:

### 401 Unauthorized
```json
{
    "error": "unauthorized",
    "message": "Missing or invalid authorization token"
}
```

### 403 Forbidden
```json
{
    "error": "forbidden",
    "message": "Insufficient permissions for this operation"
}
```

### 404 Not Found
```json
{
    "error": "not_found",
    "message": "Resource not found"
}
```

### 422 Unprocessable Entity
```json
{
    "error": "validation_failed",
    "message": "Invalid input data",
    "details": {
        "field": "error message"
    }
}
```

### 500 Internal Server Error
```json
{
    "error": "internal_error",
    "message": "An unexpected error occurred"
}
```

## Rate Limiting

API requests are limited to:
- 100 requests per minute for regular users
- 1000 requests per minute for system accounts

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Websocket Events

Real-time updates are available via websocket connection:

```
GET /api/v1/ws
Authorization: Bearer <token>
```

### Event Types

```json
{
    "type": "transfer_status_changed",
    "data": {
        "transfer_id": "uuid",
        "new_status": "APPROVED",
        "timestamp": "2024-01-01T12:00:00Z"
    }
}
```

```json
{
    "type": "property_verified",
    "data": {
        "property_id": "uuid",
        "verifier": "SGT.DOE",
        "timestamp": "2024-01-01T12:00:00Z",
        "location": {
            "building": "Armory",
            "room": "101"
        }
    }
}
```

## Testing

Test credentials are available for development:

```
Officer:
  Username: CPT.TEST
  Password: test123
  Token: eyJ0...

NCO:
  Username: SGT.TEST
  Password: test123
  Token: eyJ0...

Soldier:
  Username: PFC.TEST
  Password: test123
  Token: eyJ0...
