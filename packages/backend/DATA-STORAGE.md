# JSON File Storage System Documentation

This document explains the design and usage of the JSON file storage system for the Ultimate Habits Tracker backend.

## Architecture Overview

The file storage system consists of three main layers:

1. **FileSystemService**: Low-level file operations with atomic writes, locking, and backup functionality
2. **TypedDataService**: Type-safe CRUD operations with validation
3. **REST API Routes**: HTTP endpoints exposing the data operations

## Directory Structure

```
/data
├── habits.json            # Habits data
├── completions.json       # Habit completions data
├── notes.json             # Notes data
├── analytics.json         # Analytics data
├── settings.json          # User settings
├── templates/             # Template files for initialization
│   ├── habits.json
│   └── completions.json
└── backups/               # Backup files
    ├── habits_2023-01-01-12-30-00.bak
    ├── completions_2023-01-01-12-30-00.bak
    └── full/              # Full system backups
        └── full-backup_2023-01-01-12-30-00.zip
```

## File Naming Conventions

- **Data files**: Named after the entity type with `.json` extension (e.g., `habits.json`)
- **Backup files**: Entity name + timestamp + `.bak` extension (e.g., `habits_2023-01-01-12-30-00.bak`)
- **Full backups**: `full-backup_` + timestamp + `.zip` extension (e.g., `full-backup_2023-01-01-12-30-00.zip`)
- **Lock files**: Data file path + `.lock` extension (e.g., `habits.json.lock`)
- **Temporary files**: Data file path + `.tmp` extension (e.g., `habits.json.tmp`)

## Core Features

### Atomic Writes

All write operations are performed atomically to prevent data corruption:

1. Data is first written to a temporary file
2. The temporary file is then renamed to replace the original file
3. If any error occurs during the process, the original file remains intact

### File Locking

The system uses file locks to prevent concurrent access:

1. A lock file is created when a file is being modified
2. Other processes check for the lock before accessing the file
3. Exponential backoff is used for retry attempts
4. Locks are automatically released after operations complete

### Data Validation

Before writing data to disk, it is validated against TypeScript interfaces:

1. Each entity type has a validator function
2. These validators check both property existence and type correctness
3. Write operations fail if validation doesn't pass

### Backup and Restore

The system provides comprehensive backup capabilities:

1. **Individual entity backups**: Created automatically before any write operation
2. **Full system backups**: Archives all data files into a single ZIP file
3. **Scheduled backups**: Configurable frequency (daily/weekly/monthly)
4. **Backup rotation**: Automatically keeps only the most recent backups

## Core Services

### FileSystemService

Provides low-level file operations:

```typescript
// Create a file system service
const fileService = new FileSystemService();

// Read data from a file
const habitsResult = await fileService.readData("habits");
if (habitsResult.success) {
  const habits = habitsResult.value;
  // Use the data
}

// Write data to a file with validation
await fileService.writeData("habits", habits, isHabitsArray);

// Create a backup
await fileService.createBackup("habits");

// Restore from latest backup
await fileService.restoreFromLatestBackup("habits");
```

### TypedDataService

Provides type-safe CRUD operations:

```typescript
// Create a typed data service with validation
const habitService = new TypedDataService("habits", validators.habits);

// Get all habits
const habits = await habitService.getAll();

// Get a specific habit
const habit = await habitService.getById("123");

// Create a new habit
const newHabit = await habitService.create({
  id: "456",
  name: "Exercise",
  // ...other properties
});

// Update a habit
await habitService.update("123", { name: "Updated Name" });

// Delete a habit
await habitService.delete("123");
```

### BackupService

Manages full system backups and scheduled backups:

```typescript
// Create a backup service
const backupService = new BackupService();

// Perform a full backup
const backupPath = await backupService.performFullBackup();

// Schedule automatic backups based on settings
backupService.scheduleBackups({
  backupEnabled: true,
  backupFrequency: "daily",
});
```

## API Endpoints

The system exposes endpoints for working with backups:

- `GET /api/backups/files`: List all data files
- `GET /api/backups/entity/:entityName`: List backups for a specific entity
- `GET /api/backups/system`: List all full system backups
- `POST /api/backups/entity`: Create a backup for a specific entity
- `POST /api/backups/system`: Create a full system backup
- `POST /api/backups/restore/entity`: Restore an entity from backup
- `POST /api/backups/restore/system`: Restore from a full system backup
- `POST /api/backups/cleanup/entity`: Clean up old entity backups
- `POST /api/backups/cleanup/system`: Clean up old system backups

## Utility Scripts

Several utility scripts are provided for data management:

- `npm run init-data`: Initialize data files from templates
- `npm run backup`: Create a full system backup
- `npm run backup:clean`: Clean up old backups

## Error Handling

All operations use a consistent error handling pattern:

1. Errors are logged with details
2. Operations return a result object with `success`, `value`, and `error` properties
3. Appropriate HTTP status codes are returned from API endpoints

## Best Practices

When working with the storage system:

1. Always use the `TypedDataService` instead of direct file operations
2. Include proper validation for data using the type validators
3. Use transactions for operations that affect multiple files
4. Regularly schedule backups and test restore functionality
5. Clean up old backups to prevent disk space issues
