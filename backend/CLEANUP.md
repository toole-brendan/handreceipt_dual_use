# Backend Cleanup Plan

## Current Issues

1. **Architectural Problems**
- Mixed responsibilities in services
- Tight coupling between components
- Manual dependency management
- No clear separation between domain and infrastructure

2. **Code Organization**
- Duplicate code in backups
- Empty/incomplete handlers
- Deep directory nesting
- Scattered related code

3. **Technical Debt**
- Basic error handling
- Insufficient testing
- Hard-coded configurations
- Security concerns mixed with business logic

## Cleanup Plan

### 1. Restructure Directory Layout

```
backend/
├── src/
│   ├── domain/           # Core business logic
│   │   ├── models/       # Domain entities
│   │   ├── repositories/ # Repository interfaces
│   │   └── services/     # Domain service interfaces
│   │
│   ├── application/      # Use cases & application logic
│   │   ├── commands/     # Command handlers
│   │   ├── queries/      # Query handlers
│   │   └── services/     # Application services
│   │
│   ├── infrastructure/   # External implementations
│   │   ├── persistence/  # Database implementations
│   │   ├── security/     # Security implementations
│   │   ├── mesh/         # Mesh networking
│   │   └── blockchain/   # Blockchain integration
│   │
│   └── api/             # Web API layer
│       ├── routes/      # Route definitions
│       ├── handlers/    # Request handlers
│       ├── middleware/  # Web middleware
│       └── dto/         # Data transfer objects
```

### 2. Implement Dependency Injection

- Add proper DI container
- Define service interfaces in domain layer
- Move implementations to infrastructure
- Configure services in composition root

### 3. Improve Error Handling

- Create domain-specific errors
- Implement proper error mapping
- Add error context and logging
- Improve error responses

### 4. Security Improvements

- Separate security concerns
- Implement proper authentication flow
- Add authorization middleware
- Improve audit logging

### 5. Testing Strategy

- Add unit tests for domain logic
- Add integration tests for use cases
- Add API tests
- Implement proper test fixtures

### 6. Configuration Management

- Separate configuration by concern
- Add validation
- Implement secrets management
- Add environment-specific configs

## Implementation Steps

1. **Phase 1: Restructuring**
   - Create new directory structure
   - Move existing code to new locations
   - Fix imports and dependencies
   - Remove duplicate code

2. **Phase 2: Core Improvements**
   - Implement DI container
   - Refactor service implementations
   - Add proper error handling
   - Clean up configuration

3. **Phase 3: Testing**
   - Add test infrastructure
   - Write missing tests
   - Add CI pipeline
   - Add documentation

4. **Phase 4: Security**
   - Implement security improvements
   - Add audit logging
   - Add authorization
   - Security testing

## Migration Strategy

1. Create new structure alongside existing code
2. Gradually move functionality to new structure
3. Add tests for new structure
4. Remove old code once migrated
5. Maintain backwards compatibility during migration

## Guidelines

### Code Organization
- One responsibility per file
- Clear separation of concerns
- Dependency injection for all services
- Proper error handling

### Testing
- Unit tests for domain logic
- Integration tests for use cases
- API tests for endpoints
- Performance tests for critical paths

### Documentation
- Clear module documentation
- API documentation
- Architecture documentation
- Setup instructions

## Timeline

1. **Week 1**: Setup new structure and start migration
2. **Week 2**: Implement core improvements
3. **Week 3**: Add testing infrastructure
4. **Week 4**: Security improvements and cleanup

## Success Criteria

- Clear separation of concerns
- Improved test coverage
- Better error handling
- Reduced coupling
- Improved security
- Better maintainability
