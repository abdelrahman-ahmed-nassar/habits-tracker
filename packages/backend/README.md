# Ultimate Habits Tracker - Backend

Node.js + Express + TypeScript backend for the Ultimate Habits Tracker application.

## Directory Structure

```
src/
├── config/         # Configuration files, environment variables
├── controllers/    # Route controllers (controller layer)
├── middlewares/    # Custom Express middlewares
├── models/         # Data models and types
├── routes/         # Route definitions
├── services/       # Business logic (service layer)
├── utils/          # Utility functions and helpers
├── types/          # TypeScript type definitions
└── server.ts       # Express app initialization
```

## Getting Started

### Environment Variables

The backend uses environment variables for configuration. Copy `sample.env` to `.env` and adjust as needed:

```bash
cp sample.env .env
```

Available environment variables:

| Variable    | Description                          | Default               |
| ----------- | ------------------------------------ | --------------------- |
| NODE_ENV    | Environment (development/production) | development           |
| PORT        | Server port                          | 3001                  |
| CORS_ORIGIN | Allowed CORS origin                  | http://localhost:3000 |
| DATA_DIR    | Directory to store JSON data files   | ./data                |
| LOG_LEVEL   | Log level (debug/info/warn/error)    | info                  |

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

## Testing

The backend uses Jest and Supertest for unit and integration testing.

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode during development
npm run test:watch

# Run only server tests
npm run test:server

# Run only middleware tests
npm run test:middlewares
```

### Test Structure

```
src/__tests__/
├── server/          # Server startup and endpoints tests
├── middlewares/     # Middleware tests
└── typescript-compilation.test.ts  # TypeScript compilation verification
```

### Test Coverage

The test suite covers:

1. Server startup and port binding
2. CORS configuration
3. Middleware chain execution
4. Error handling middleware
5. TypeScript compilation

## API Structure

### Middleware Chain

The Express application uses the following middleware chain:

1. CORS configuration
2. Helmet (security headers)
3. JSON body parsing
4. URL-encoded body parsing
5. Custom request logging
6. Custom response formatting
7. Route handlers
8. 404 handler
9. Global error handler

### Custom Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Success message",
  "data": {
    /* Response data */
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

For errors:

```json
{
  "success": false,
  "error": "ErrorType",
  "message": "Error message",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

## API Endpoints

The backend provides RESTful API endpoints for:

- Habit management
- Completion tracking
- Notes and motivations
- Analytics data
- Settings

## Data Storage

All data is stored locally using JSON files, rather than a database.
