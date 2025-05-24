# Local Habits Tracker API Documentation

## Overview

The Local Habits Tracker API is a RESTful service that provides endpoints for managing habits, tracking completions, analyzing progress, and managing notes. All data is stored locally in JSON files.

## Base URL

```
http://localhost:5000/api
```

## Authentication

This is a local-first application, so no authentication is required. All data is stored on the user's machine.

## Common Response Formats

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## Habit Management

### Get All Habits

```http
GET /habits
```

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "tag": "string",
      "repetition": "daily" | "weekly" | "monthly",
      "specificDays": [0, 1, 2, 3, 4, 5, 6],
      "goalType": "counter" | "streak",
      "goalValue": number,
      "currentStreak": number,
      "bestStreak": number,
      "createdAt": "string",
      "motivationNote": "string",
      "isActive": boolean
    }
  ]
}
```

### Get Habit by ID

```http
GET /habits/:id
```

**Response**

```json
{
  "success": true,
  "data": {
    // Single habit object
  }
}
```

### Create Habit

```http
POST /habits
```

**Request Body**

```json
{
  "name": "string",
  "description": "string",
  "tag": "string",
  "repetition": "daily" | "weekly" | "monthly",
  "specificDays": [0, 1, 2, 3, 4, 5, 6],
  "goalType": "counter" | "streak",
  "goalValue": number,
  "motivationNote": "string"
}
```

### Update Habit

```http
PUT /habits/:id
```

**Request Body**

```json
{
  // Same as create, all fields optional
}
```

### Delete Habit

```http
DELETE /habits/:id
```

## Completion Tracking

### Get Daily Completions

```http
GET /completions/date/:date
```

**Parameters**

- `date`: YYYY-MM-DD format

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "habitId": "string",
      "date": "string",
      "completed": boolean,
      "value": number,
      "completedAt": "string"
    }
  ]
}
```

### Get Habit Completions

```http
GET /completions/habit/:habitId
```

### Get Completions for Date Range

```http
GET /completions/range/:startDate/:endDate
```

### Mark Habit Complete

```http
POST /completions
```

**Request Body**

```json
{
  "habitId": "string",
  "date": "string",
  "value": number
}
```

### Toggle Completion

```http
POST /completions/toggle
```

**Request Body**

```json
{
  "habitId": "string",
  "date": "string"
}
```

### Delete Completion

```http
DELETE /completions/:habitId/:date
```

## Analytics

### Get Overall Analytics

```http
GET /analytics/overview
```

**Response**

```json
{
  "success": true,
  "data": {
    "totalHabits": number,
    "activeHabits": number,
    "completionRate": number,
    "currentStreaks": {
      "average": number,
      "longest": number
    },
    "recentTrends": {
      "daily": number,
      "weekly": number,
      "monthly": number
    }
  }
}
```

### Get Habit Analytics

```http
GET /analytics/habits/:id
```

### Get Daily Analytics

```http
GET /analytics/daily/:date
```

### Get Weekly Analytics

```http
GET /analytics/weekly/:startDate
```

### Get Monthly Analytics

```http
GET /analytics/monthly/:year/:month
```

## Notes

### Get All Notes

```http
GET /notes
```

### Get Notes for Date

```http
GET /notes/:date
```

### Create Note

```http
POST /notes
```

**Request Body**

```json
{
  "date": "string",
  "content": "string",
  "type": "daily" | "motivation"
}
```

### Update Note

```http
PUT /notes/:id
```

### Delete Note

```http
DELETE /notes/:id
```

## Error Codes

| Code | Description                            |
| ---- | -------------------------------------- |
| 400  | Bad Request - Invalid input parameters |
| 404  | Not Found - Resource doesn't exist     |
| 500  | Internal Server Error                  |

## Rate Limiting

No rate limiting is implemented as this is a local-first application.

## Performance Considerations

1. Analytics endpoints use caching to improve performance
2. Date-based queries are optimized for local JSON storage
3. Bulk operations are supported for better performance

## Data Validation

1. Dates must be in YYYY-MM-DD format
2. Habit names must be non-empty strings
3. Goal values must be positive numbers
4. Specific days must be valid for the repetition type:
   - Daily: No specific days
   - Weekly: 0-6 (Sunday-Saturday)
   - Monthly: 1-31

## Relationships

1. Habits have many Completions
2. Completions belong to one Habit
3. Notes can be associated with either a specific date or a habit
4. Analytics are calculated from Completions data
