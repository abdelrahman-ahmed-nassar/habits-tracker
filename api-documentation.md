# Local Habits Tracker API Documentation

This document provides comprehensive documentation for the Local Habits Tracker REST API.

## Table of Contents

1. [Authentication](#authentication)
2. [Error Handling](#error-handling)
3. [Rate Limiting](#rate-limiting)
4. [Habit Management](#habit-management)
5. [Completion Tracking](#completion-tracking)
6. [Analytics](#analytics)
7. [Backup and Restore](#backup-and-restore)
8. [Schema Definitions](#schema-definitions)

## Authentication

The Local Habits Tracker API is designed for local usage and does not require authentication.

## Error Handling

All API endpoints use consistent error handling. Error responses follow this format:

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

Common HTTP status codes:

| Status Code | Description                                                |
| ----------- | ---------------------------------------------------------- |
| 200         | Success                                                    |
| 400         | Bad Request - Invalid input parameters                     |
| 404         | Not Found - Resource doesn't exist                         |
| 409         | Conflict - Resource already exists or operation conflicts  |
| 422         | Unprocessable Entity - Validation error                    |
| 500         | Internal Server Error - Something went wrong on the server |

## Rate Limiting

Since this is a local application, there are no rate limits imposed on API requests.

## Habit Management

### Get All Habits

Retrieves all habits with optional filtering.

**Endpoint:** `GET /api/habits`

**Query Parameters:**

| Parameter | Type    | Required | Description                             |
| --------- | ------- | -------- | --------------------------------------- |
| tag       | string  | No       | Filter habits by tag                    |
| archived  | boolean | No       | Filter by archived status (true/false)  |
| sort      | string  | No       | Sort field (name, createdAt, updatedAt) |
| order     | string  | No       | Sort order (asc, desc)                  |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "habid-123",
      "name": "Daily Meditation",
      "tag": "wellness",
      "repetition": "daily",
      "specificDays": null,
      "specificDates": null,
      "goalType": "streak",
      "goalValue": 7,
      "createdAt": "2023-10-15T08:00:00.000Z",
      "updatedAt": "2023-10-15T08:00:00.000Z",
      "color": "#4A90E2",
      "icon": "meditation",
      "archived": false
    }
  ],
  "message": "Habits retrieved successfully"
}
```

### Get Habit by ID

Retrieves a single habit by its ID.

**Endpoint:** `GET /api/habits/:id`

**URL Parameters:**

| Parameter | Type   | Required | Description                   |
| --------- | ------ | -------- | ----------------------------- |
| id        | string | Yes      | The habit's unique identifier |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "habid-123",
    "name": "Daily Meditation",
    "tag": "wellness",
    "repetition": "daily",
    "specificDays": null,
    "specificDates": null,
    "goalType": "streak",
    "goalValue": 7,
    "createdAt": "2023-10-15T08:00:00.000Z",
    "updatedAt": "2023-10-15T08:00:00.000Z",
    "color": "#4A90E2",
    "icon": "meditation",
    "archived": false
  },
  "message": "Habit retrieved successfully"
}
```

**Error Responses:**

| Status Code | Description                           |
| ----------- | ------------------------------------- |
| 404         | Habit with the specified ID not found |

### Create Habit

Creates a new habit.

**Endpoint:** `POST /api/habits`

**Request Body:**

```json
{
  "name": "Daily Meditation",
  "tag": "wellness",
  "repetition": "daily",
  "specificDays": [1, 3, 5],
  "goalType": "streak",
  "goalValue": 7,
  "color": "#4A90E2",
  "icon": "meditation"
}
```

**Required Fields:**

| Field      | Type   | Description                                                             |
| ---------- | ------ | ----------------------------------------------------------------------- |
| name       | string | Habit name (1-100 characters)                                           |
| tag        | string | Category tag                                                            |
| repetition | string | One of: "daily", "weekly", "monthly", "specific-days", "specific-dates" |
| goalType   | string | One of: "streak", "counter"                                             |
| goalValue  | number | Target goal value                                                       |

**Optional Fields:**

| Field         | Type     | Description                                                          |
| ------------- | -------- | -------------------------------------------------------------------- |
| specificDays  | number[] | Days of week (0-6, Sunday-Saturday) if repetition is "specific-days" |
| specificDates | number[] | Days of month (1-31) if repetition is "specific-dates"               |
| color         | string   | Color hex code                                                       |
| icon          | string   | Icon identifier                                                      |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "habid-123",
    "name": "Daily Meditation",
    "tag": "wellness",
    "repetition": "daily",
    "specificDays": [1, 3, 5],
    "specificDates": null,
    "goalType": "streak",
    "goalValue": 7,
    "createdAt": "2023-10-15T08:00:00.000Z",
    "updatedAt": "2023-10-15T08:00:00.000Z",
    "color": "#4A90E2",
    "icon": "meditation",
    "archived": false
  },
  "message": "Habit created successfully"
}
```

**Error Responses:**

| Status Code | Description          |
| ----------- | -------------------- |
| 400         | Invalid request body |
| 422         | Validation error     |

### Update Habit

Updates an existing habit.

**Endpoint:** `PUT /api/habits/:id`

**URL Parameters:**

| Parameter | Type   | Required | Description                   |
| --------- | ------ | -------- | ----------------------------- |
| id        | string | Yes      | The habit's unique identifier |

**Request Body:**
Same as for creating a habit, but all fields are optional.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "habid-123",
    "name": "Updated Meditation",
    "tag": "wellness",
    "repetition": "daily",
    "specificDays": null,
    "specificDates": null,
    "goalType": "streak",
    "goalValue": 10,
    "createdAt": "2023-10-15T08:00:00.000Z",
    "updatedAt": "2023-10-16T09:30:00.000Z",
    "color": "#4A90E2",
    "icon": "meditation",
    "archived": false
  },
  "message": "Habit updated successfully"
}
```

**Error Responses:**

| Status Code | Description                           |
| ----------- | ------------------------------------- |
| 404         | Habit with the specified ID not found |
| 422         | Validation error                      |

### Delete Habit

Deletes a habit permanently.

**Endpoint:** `DELETE /api/habits/:id`

**URL Parameters:**

| Parameter | Type   | Required | Description                   |
| --------- | ------ | -------- | ----------------------------- |
| id        | string | Yes      | The habit's unique identifier |

**Query Parameters:**

| Parameter         | Type    | Required | Description                                         |
| ----------------- | ------- | -------- | --------------------------------------------------- |
| deleteCompletions | boolean | No       | Whether to also delete completions (default: false) |

**Response:**

```json
{
  "success": true,
  "data": true,
  "message": "Habit deleted successfully"
}
```

**Error Responses:**

| Status Code | Description                           |
| ----------- | ------------------------------------- |
| 404         | Habit with the specified ID not found |

### Archive Habit

Archives a habit (soft delete).

**Endpoint:** `PATCH /api/habits/:id/archive`

**URL Parameters:**

| Parameter | Type   | Required | Description                   |
| --------- | ------ | -------- | ----------------------------- |
| id        | string | Yes      | The habit's unique identifier |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "habid-123",
    "archived": true,
    "updatedAt": "2023-10-16T10:00:00.000Z"
  },
  "message": "Habit archived successfully"
}
```

**Error Responses:**

| Status Code | Description                           |
| ----------- | ------------------------------------- |
| 404         | Habit with the specified ID not found |

### Restore Habit

Restores an archived habit.

**Endpoint:** `PATCH /api/habits/:id/restore`

**URL Parameters:**

| Parameter | Type   | Required | Description                   |
| --------- | ------ | -------- | ----------------------------- |
| id        | string | Yes      | The habit's unique identifier |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "habid-123",
    "archived": false,
    "updatedAt": "2023-10-16T10:30:00.000Z"
  },
  "message": "Habit restored successfully"
}
```

**Error Responses:**

| Status Code | Description                           |
| ----------- | ------------------------------------- |
| 404         | Habit with the specified ID not found |

## Completion Tracking

### Mark Habit as Complete

Marks a habit as complete for a specific date.

**Endpoint:** `POST /api/habits/:id/complete`

**URL Parameters:**

| Parameter | Type   | Required | Description                   |
| --------- | ------ | -------- | ----------------------------- |
| id        | string | Yes      | The habit's unique identifier |

**Request Body:**

```json
{
  "date": "2023-10-15",
  "value": 30,
  "notes": "Meditated for 30 minutes"
}
```

**Required Fields:**

| Field | Type   | Description               |
| ----- | ------ | ------------------------- |
| date  | string | Date in YYYY-MM-DD format |

**Optional Fields:**

| Field | Type   | Description                   |
| ----- | ------ | ----------------------------- |
| value | number | Value for counter-type habits |
| notes | string | Notes about the completion    |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "comp-123",
    "habitId": "habid-123",
    "date": "2023-10-15",
    "completed": true,
    "value": 30,
    "notes": "Meditated for 30 minutes",
    "createdAt": "2023-10-15T18:00:00.000Z",
    "updatedAt": "2023-10-15T18:00:00.000Z"
  },
  "message": "Habit marked as complete"
}
```

**Error Responses:**

| Status Code | Description                           |
| ----------- | ------------------------------------- |
| 404         | Habit with the specified ID not found |
| 422         | Invalid date format                   |

### Remove Completion Record

Removes a completion record for a habit on a specific date.

**Endpoint:** `DELETE /api/habits/:id/complete/:date`

**URL Parameters:**

| Parameter | Type   | Required | Description                   |
| --------- | ------ | -------- | ----------------------------- |
| id        | string | Yes      | The habit's unique identifier |
| date      | string | Yes      | Date in YYYY-MM-DD format     |

**Response:**

```json
{
  "success": true,
  "data": true,
  "message": "Completion record removed successfully"
}
```

**Error Responses:**

| Status Code | Description                          |
| ----------- | ------------------------------------ |
| 404         | Habit or completion record not found |
| 422         | Invalid date format                  |

### Get Habit Completion History

Retrieves completion history for a specific habit.

**Endpoint:** `GET /api/habits/:id/records`

**URL Parameters:**

| Parameter | Type   | Required | Description                   |
| --------- | ------ | -------- | ----------------------------- |
| id        | string | Yes      | The habit's unique identifier |

**Query Parameters:**

| Parameter | Type   | Required | Description                     |
| --------- | ------ | -------- | ------------------------------- |
| startDate | string | No       | Start date in YYYY-MM-DD format |
| endDate   | string | No       | End date in YYYY-MM-DD format   |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "comp-123",
      "habitId": "habid-123",
      "date": "2023-10-15",
      "completed": true,
      "value": 30,
      "notes": "Meditated for 30 minutes",
      "createdAt": "2023-10-15T18:00:00.000Z",
      "updatedAt": "2023-10-15T18:00:00.000Z"
    }
  ],
  "message": "Completion records retrieved successfully"
}
```

### Get Daily Completions

Retrieves all completions for a specific date.

**Endpoint:** `GET /api/completions/daily/:date`

**URL Parameters:**

| Parameter | Type   | Required | Description               |
| --------- | ------ | -------- | ------------------------- |
| date      | string | Yes      | Date in YYYY-MM-DD format |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "comp-123",
      "habitId": "habid-123",
      "date": "2023-10-15",
      "completed": true,
      "value": 30,
      "notes": "Meditated for 30 minutes",
      "createdAt": "2023-10-15T18:00:00.000Z",
      "updatedAt": "2023-10-15T18:00:00.000Z"
    }
  ],
  "message": "Daily completions retrieved successfully"
}
```

### Get Completions in Range

Retrieves completions for a date range.

**Endpoint:** `GET /api/completions/range`

**Query Parameters:**

| Parameter | Type   | Required | Description                     |
| --------- | ------ | -------- | ------------------------------- |
| startDate | string | Yes      | Start date in YYYY-MM-DD format |
| endDate   | string | Yes      | End date in YYYY-MM-DD format   |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "comp-123",
      "habitId": "habid-123",
      "date": "2023-10-15",
      "completed": true,
      "value": 30,
      "notes": "Meditated for 30 minutes",
      "createdAt": "2023-10-15T18:00:00.000Z",
      "updatedAt": "2023-10-15T18:00:00.000Z"
    }
  ],
  "message": "Completions retrieved successfully"
}
```

### Bulk Complete Habits

Marks multiple habits as complete in a single request.

**Endpoint:** `POST /api/completions/bulk`

**Request Body:**

```json
[
  {
    "habitId": "habid-123",
    "date": "2023-10-15",
    "value": 30
  },
  {
    "habitId": "habid-456",
    "date": "2023-10-15"
  }
]
```

**Required Fields (for each item):**

| Field   | Type   | Description               |
| ------- | ------ | ------------------------- |
| habitId | string | Habit's unique identifier |
| date    | string | Date in YYYY-MM-DD format |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "comp-123",
      "habitId": "habid-123",
      "date": "2023-10-15",
      "completed": true,
      "value": 30,
      "createdAt": "2023-10-15T18:00:00.000Z",
      "updatedAt": "2023-10-15T18:00:00.000Z"
    },
    {
      "id": "comp-456",
      "habitId": "habid-456",
      "date": "2023-10-15",
      "completed": true,
      "createdAt": "2023-10-15T18:00:00.000Z",
      "updatedAt": "2023-10-15T18:00:00.000Z"
    }
  ],
  "message": "Bulk completion successful"
}
```

## Analytics

### Get Overall Analytics

Retrieves overall analytics for all habits.

**Endpoint:** `GET /api/analytics/overview`

**Query Parameters:**

| Parameter       | Type    | Required | Description                                         |
| --------------- | ------- | -------- | --------------------------------------------------- |
| startDate       | string  | Yes      | Start date in YYYY-MM-DD format                     |
| endDate         | string  | Yes      | End date in YYYY-MM-DD format                       |
| includeArchived | boolean | No       | Whether to include archived habits (default: false) |

**Response:**

```json
{
  "success": true,
  "data": {
    "totalHabits": 10,
    "activeHabits": 8,
    "archivedHabits": 2,
    "completionRate": 0.85,
    "completedHabits": 68,
    "totalPossibleHabits": 80,
    "streakStats": {
      "averageStreak": 5.2,
      "maxStreak": 15,
      "habitsWithStreak": 6
    }
  },
  "message": "Overall analytics retrieved successfully"
}
```

### Get Habit Analytics

Retrieves analytics for a specific habit.

**Endpoint:** `GET /api/analytics/habits/:id`

**URL Parameters:**

| Parameter | Type   | Required | Description                   |
| --------- | ------ | -------- | ----------------------------- |
| id        | string | Yes      | The habit's unique identifier |

**Query Parameters:**

| Parameter | Type   | Required | Description                     |
| --------- | ------ | -------- | ------------------------------- |
| startDate | string | Yes      | Start date in YYYY-MM-DD format |
| endDate   | string | Yes      | End date in YYYY-MM-DD format   |

**Response:**

```json
{
  "success": true,
  "data": {
    "habitId": "habid-123",
    "habitName": "Daily Meditation",
    "completionRate": 0.9,
    "completedDays": 27,
    "totalPossibleDays": 30,
    "streak": {
      "current": 5,
      "longest": 15,
      "history": [
        { "start": "2023-09-01", "end": "2023-09-15", "length": 15 },
        { "start": "2023-09-20", "end": "2023-09-24", "length": 5 }
      ]
    },
    "counterStats": {
      "total": 810,
      "average": 30,
      "min": 20,
      "max": 45
    }
  },
  "message": "Habit analytics retrieved successfully"
}
```

### Get Completion Trends

Retrieves completion trends over time.

**Endpoint:** `GET /api/analytics/trends`

**Query Parameters:**

| Parameter       | Type    | Required | Description                                                |
| --------------- | ------- | -------- | ---------------------------------------------------------- |
| startDate       | string  | Yes      | Start date in YYYY-MM-DD format                            |
| endDate         | string  | Yes      | End date in YYYY-MM-DD format                              |
| granularity     | string  | No       | Time granularity (daily, weekly, monthly) (default: daily) |
| includeArchived | boolean | No       | Whether to include archived habits (default: false)        |

**Response:**

```json
{
  "success": true,
  "data": {
    "timePoints": ["2023-10-01", "2023-10-02", "2023-10-03"],
    "completionRates": [0.8, 0.9, 0.75],
    "habitData": {
      "habid-123": [true, true, false],
      "habid-456": [true, true, true]
    }
  },
  "message": "Completion trends retrieved successfully"
}
```

### Get Daily Analytics

Retrieves analytics for a specific day.

**Endpoint:** `GET /api/analytics/daily/:date`

**URL Parameters:**

| Parameter | Type   | Required | Description               |
| --------- | ------ | -------- | ------------------------- |
| date      | string | Yes      | Date in YYYY-MM-DD format |

**Response:**

```json
{
  "success": true,
  "data": {
    "date": "2023-10-15",
    "completionRate": 0.85,
    "completedHabits": 17,
    "totalHabits": 20,
    "habitDetails": [
      {
        "habitId": "habid-123",
        "name": "Daily Meditation",
        "completed": true,
        "value": 30
      }
    ]
  },
  "message": "Daily analytics retrieved successfully"
}
```

### Get Weekly Analytics

Retrieves analytics for a specific week.

**Endpoint:** `GET /api/analytics/weekly/:startDate`

**URL Parameters:**

| Parameter | Type   | Required | Description                             |
| --------- | ------ | -------- | --------------------------------------- |
| startDate | string | Yes      | Start date of week in YYYY-MM-DD format |

**Response:**

```json
{
  "success": true,
  "data": {
    "startDate": "2023-10-15",
    "endDate": "2023-10-21",
    "completionRate": 0.82,
    "completedHabits": 115,
    "totalHabits": 140,
    "dailyStats": [
      {
        "date": "2023-10-15",
        "completionRate": 0.85
      }
    ],
    "habitDetails": [
      {
        "habitId": "habid-123",
        "name": "Daily Meditation",
        "completedDays": 7,
        "possibleDays": 7,
        "completionRate": 1.0
      }
    ]
  },
  "message": "Weekly analytics retrieved successfully"
}
```

### Get Monthly Analytics

Retrieves analytics for a specific month.

**Endpoint:** `GET /api/analytics/monthly/:year/:month`

**URL Parameters:**

| Parameter | Type   | Required | Description       |
| --------- | ------ | -------- | ----------------- |
| year      | string | Yes      | Year (e.g., 2023) |
| month     | string | Yes      | Month (1-12)      |

**Response:**

```json
{
  "success": true,
  "data": {
    "year": 2023,
    "month": 10,
    "completionRate": 0.8,
    "completedHabits": 496,
    "totalHabits": 620,
    "weeklyStats": [
      {
        "startDate": "2023-10-01",
        "endDate": "2023-10-07",
        "completionRate": 0.82
      }
    ],
    "habitDetails": [
      {
        "habitId": "habid-123",
        "name": "Daily Meditation",
        "completedDays": 30,
        "possibleDays": 31,
        "completionRate": 0.97
      }
    ]
  },
  "message": "Monthly analytics retrieved successfully"
}
```

### Get Day of Week Analysis

Retrieves day-of-week analytics.

**Endpoint:** `GET /api/analytics/day-of-week`

**Query Parameters:**

| Parameter       | Type    | Required | Description                                         |
| --------------- | ------- | -------- | --------------------------------------------------- |
| startDate       | string  | Yes      | Start date in YYYY-MM-DD format                     |
| endDate         | string  | Yes      | End date in YYYY-MM-DD format                       |
| includeArchived | boolean | No       | Whether to include archived habits (default: false) |

**Response:**

```json
{
  "success": true,
  "data": {
    "dayRates": [
      { "day": 0, "name": "Sunday", "completionRate": 0.7 },
      { "day": 1, "name": "Monday", "completionRate": 0.85 },
      { "day": 2, "name": "Tuesday", "completionRate": 0.9 },
      { "day": 3, "name": "Wednesday", "completionRate": 0.8 },
      { "day": 4, "name": "Thursday", "completionRate": 0.75 },
      { "day": 5, "name": "Friday", "completionRate": 0.65 },
      { "day": 6, "name": "Saturday", "completionRate": 0.6 }
    ],
    "bestDay": { "day": 2, "name": "Tuesday", "completionRate": 0.9 },
    "worstDay": { "day": 6, "name": "Saturday", "completionRate": 0.6 }
  },
  "message": "Day of week analysis retrieved successfully"
}
```

### Get Tag Analytics

Retrieves analytics by habit tags/categories.

**Endpoint:** `GET /api/analytics/tags`

**Query Parameters:**

| Parameter       | Type    | Required | Description                                         |
| --------------- | ------- | -------- | --------------------------------------------------- |
| startDate       | string  | Yes      | Start date in YYYY-MM-DD format                     |
| endDate         | string  | Yes      | End date in YYYY-MM-DD format                       |
| includeArchived | boolean | No       | Whether to include archived habits (default: false) |

**Response:**

```json
{
  "success": true,
  "data": {
    "tagStats": [
      {
        "tag": "wellness",
        "habitCount": 5,
        "completionRate": 0.85,
        "habits": [
          {
            "habitId": "habid-123",
            "name": "Daily Meditation",
            "completionRate": 0.9
          }
        ]
      },
      {
        "tag": "productivity",
        "habitCount": 3,
        "completionRate": 0.75,
        "habits": [
          {
            "habitId": "habid-456",
            "name": "Morning Planning",
            "completionRate": 0.8
          }
        ]
      }
    ]
  },
  "message": "Tag analytics retrieved successfully"
}
```

## Backup and Restore

### List Data Files

Retrieves a list of all data files.

**Endpoint:** `GET /api/backup/files`

**Response:**

```json
{
  "success": true,
  "data": ["habits.json", "completions.json"],
  "message": "Data files retrieved successfully"
}
```

### List Entity Backups

Retrieves a list of backups for a specific entity.

**Endpoint:** `GET /api/backup/entity/:entityName`

**URL Parameters:**

| Parameter  | Type   | Required | Description                                 |
| ---------- | ------ | -------- | ------------------------------------------- |
| entityName | string | Yes      | The entity name (e.g., habits, completions) |

**Response:**

```json
{
  "success": true,
  "data": ["habits_20231015_120000.json", "habits_20231014_120000.json"],
  "message": "Backups for habits retrieved successfully"
}
```

### List System Backups

Retrieves a list of all full system backups.

**Endpoint:** `GET /api/backup/system`

**Response:**

```json
{
  "success": true,
  "data": ["backup_20231015_120000.zip", "backup_20231014_120000.zip"],
  "message": "Full system backups retrieved successfully"
}
```

### Create Entity Backup

Creates a backup of a specific entity.

**Endpoint:** `POST /api/backup/entity`

**Request Body:**

```json
{
  "entityName": "habits"
}
```

**Required Fields:**

| Field      | Type   | Description                                 |
| ---------- | ------ | ------------------------------------------- |
| entityName | string | The entity name (e.g., habits, completions) |

**Response:**

```json
{
  "success": true,
  "data": "habits_20231016_120000.json",
  "message": "Backup of habits created successfully"
}
```

### Create System Backup

Creates a full system backup.

**Endpoint:** `POST /api/backup/system`

**Response:**

```json
{
  "success": true,
  "data": "backup_20231016_120000.zip",
  "message": "Full system backup created successfully"
}
```

### Restore Entity Backup

Restores a specific entity from backup.

**Endpoint:** `POST /api/backup/restore/entity`

**Request Body:**

```json
{
  "entityName": "habits",
  "backupName": "habits_20231015_120000.json"
}
```

**Required Fields:**

| Field      | Type   | Description                                 |
| ---------- | ------ | ------------------------------------------- |
| entityName | string | The entity name (e.g., habits, completions) |

**Optional Fields:**

| Field      | Type   | Description                                                   |
| ---------- | ------ | ------------------------------------------------------------- |
| backupName | string | Specific backup file to restore (if omitted, uses the latest) |

**Response:**

```json
{
  "success": true,
  "data": "habits_20231015_120000.json",
  "message": "habits restored successfully from backup"
}
```

### Restore System Backup

Restores from a full system backup.

**Endpoint:** `POST /api/backup/restore/system`

**Request Body:**

```json
{
  "backupName": "backup_20231015_120000.zip"
}
```

**Required Fields:**

| Field      | Type   | Description          |
| ---------- | ------ | -------------------- |
| backupName | string | The backup file name |

**Response:**

```json
{
  "success": true,
  "data": true,
  "message": "System restored successfully from backup"
}
```

### Clean Up Entity Backups

Cleans up old entity backups.

**Endpoint:** `POST /api/backup/cleanup/entity`

**Request Body:**

```json
{
  "entityName": "habits",
  "keepCount": 5
}
```

**Required Fields:**

| Field      | Type   | Description                                 |
| ---------- | ------ | ------------------------------------------- |
| entityName | string | The entity name (e.g., habits, completions) |

**Optional Fields:**

| Field     | Type   | Description                                   |
| --------- | ------ | --------------------------------------------- |
| keepCount | number | Number of recent backups to keep (default: 5) |

**Response:**

```json
{
  "success": true,
  "data": 3,
  "message": "Cleaned up old backups for habits, kept the 5 most recent"
}
```

## Schema Definitions

### Habit

```typescript
interface IHabit {
  id: string;
  name: string;
  tag: string;
  repetition: string; // "daily", "weekly", "monthly", "specific-days", "specific-dates"
  specificDays?: number[]; // Days of week (0-6, Sunday-Saturday)
  specificDates?: number[]; // Days of month (1-31)
  goalType: string; // "streak", "counter"
  goalValue: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  color?: string; // Hex color code
  icon?: string; // Icon identifier
  archived?: boolean; // Default: false
}
```

### Completion

```typescript
interface ICompletion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  value?: number; // For counter-type habits
  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
```

### Analytics

```typescript
interface IAnalytics {
  id: string;
  habitId: string;
  period: string; // "daily", "weekly", "monthly"
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
  totalCompletions: number;
  streakCurrent: number;
  streakLongest: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
```

### Settings

```typescript
interface ISettings {
  id: string;
  userId: string;
  theme: string; // "light", "dark", "system"
  firstDayOfWeek: number; // 0-6 (Sunday-Saturday)
  backupEnabled: boolean;
  backupFrequency: "daily" | "weekly" | "monthly";
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
```
