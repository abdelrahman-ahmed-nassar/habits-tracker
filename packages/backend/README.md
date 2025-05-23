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
└── server.ts       # Express app initialization
```

## Getting Started

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
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
