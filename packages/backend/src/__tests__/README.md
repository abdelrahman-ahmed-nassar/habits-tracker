# Ultimate Habits Tracker - Backend Tests

This directory contains comprehensive tests for the Ultimate Habits Tracker backend services.

## Test Structure

Tests are organized to match the directory structure of the source code:

- `services/` - Tests for service classes
- `utils/` - Tests for utility functions
- `middlewares/` - Tests for Express middleware
- `server/` - Tests for server configuration and API endpoints

## Testing Approach

### Data Models & File System Services

The data storage layer consists of:

1. `FileSystemService` - Low-level file operations with JSON data
2. `TypedDataService` - Generic CRUD operations with typed entities
3. Type validators - Ensure data integrity before storage

Tests focus on:

- Validating TypeScript interfaces
- Testing atomic file operations (read/write/lock)
- Error handling for file system failures
- Data validation before writing
- Backup and restore functionality

### Mocking Strategy

File system operations are mocked using Jest mock functions:

```typescript
jest.mock("fs/promises");
jest.mock("fs");
jest.mock("path");
```

This allows tests to:

- Simulate success/failure conditions
- Test error handling paths
- Run without requiring actual file system access

## Running Tests

Run all tests:

```
npm test
```

Run specific test suites:

```
npm test -- services/fileSystemService
npm test -- utils/typeValidators
```

Generate coverage report:

```
npm run test:coverage
```

## Coverage Goals

The test suite aims for high coverage of core service classes:

- FileSystemService: >70% line coverage
- TypedDataService: >90% line coverage
- Type validators: >95% line coverage

## Test Best Practices

1. **Mock External Dependencies**: File system, network requests, etc.
2. **Test Error Paths**: Not just happy paths
3. **Test Validation Logic**: Ensure data integrity
4. **Isolate Tests**: Each test should be independent
5. **Clean Mocks Between Tests**: Use beforeEach to reset mock state
