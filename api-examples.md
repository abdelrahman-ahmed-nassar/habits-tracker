# Local Habits Tracker API Examples

This document provides examples of requests and responses for testing the Local Habits Tracker API endpoints.

## Table of Contents

1. [Habits](#habits)
2. [Completions](#completions)
3. [Analytics](#analytics)
4. [Backup and Restore](#backup-and-restore)

## Habits

### Create a New Habit

**Request:**

```bash
curl -X POST http://localhost:3001/api/habits \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Daily Meditation",
    "tag": "wellness",
    "repetition": "daily",
    "goalType": "streak",
    "goalValue": 7,
    "color": "#4A90E2",
    "icon": "meditation"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "h_1634289600000",
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
  "message": "Habit created successfully"
}
```

### Get All Habits

**Request:**

```bash
curl http://localhost:3001/api/habits
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "h_1634289600000",
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
    {
      "id": "h_1634376000000",
      "name": "Exercise",
      "tag": "fitness",
      "repetition": "specific-days",
      "specificDays": [1, 3, 5],
      "specificDates": null,
      "goalType": "counter",
      "goalValue": 30,
      "createdAt": "2023-10-16T08:00:00.000Z",
      "updatedAt": "2023-10-16T08:00:00.000Z",
      "color": "#50E3C2",
      "icon": "dumbbell",
      "archived": false
    }
  ],
  "message": "Habits retrieved successfully"
}
```

### Get Habit by ID

**Request:**

```bash
curl http://localhost:3001/api/habits/h_1634289600000
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "h_1634289600000",
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

### Update a Habit

**Request:**

```bash
curl -X PUT http://localhost:3001/api/habits/h_1634289600000 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Morning Meditation",
    "goalValue": 10
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "h_1634289600000",
    "name": "Morning Meditation",
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

### Archive a Habit

**Request:**

```bash
curl -X PATCH http://localhost:3001/api/habits/h_1634289600000/archive
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "h_1634289600000",
    "archived": true,
    "updatedAt": "2023-10-16T10:00:00.000Z"
  },
  "message": "Habit archived successfully"
}
```

### Restore an Archived Habit

**Request:**

```bash
curl -X PATCH http://localhost:3001/api/habits/h_1634289600000/restore
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "h_1634289600000",
    "archived": false,
    "updatedAt": "2023-10-16T10:30:00.000Z"
  },
  "message": "Habit restored successfully"
}
```

### Delete a Habit

**Request:**

```bash
curl -X DELETE http://localhost:3001/api/habits/h_1634289600000
```

**Response:**

```json
{
  "success": true,
  "data": true,
  "message": "Habit deleted successfully"
}
```

## Completions

### Mark Habit as Complete

**Request:**

```bash
curl -X POST http://localhost:3001/api/habits/h_1634289600000/complete \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2023-10-15",
    "value": 30,
    "notes": "Meditated for 30 minutes"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "c_1634289600000",
    "habitId": "h_1634289600000",
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

### Remove Completion Record

**Request:**

```bash
curl -X DELETE http://localhost:3001/api/habits/h_1634289600000/complete/2023-10-15
```

**Response:**

```json
{
  "success": true,
  "data": true,
  "message": "Completion record removed successfully"
}
```

### Get Habit Completion History

**Request:**

```bash
curl http://localhost:3001/api/habits/h_1634289600000/records?startDate=2023-10-01&endDate=2023-10-31
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "c_1634289600000",
      "habitId": "h_1634289600000",
      "date": "2023-10-15",
      "completed": true,
      "value": 30,
      "notes": "Meditated for 30 minutes",
      "createdAt": "2023-10-15T18:00:00.000Z",
      "updatedAt": "2023-10-15T18:00:00.000Z"
    },
    {
      "id": "c_1634376000000",
      "habitId": "h_1634289600000",
      "date": "2023-10-16",
      "completed": true,
      "value": 25,
      "notes": "Shorter session today",
      "createdAt": "2023-10-16T17:30:00.000Z",
      "updatedAt": "2023-10-16T17:30:00.000Z"
    }
  ],
  "message": "Completion records retrieved successfully"
}
```

### Get Daily Completions

**Request:**

```bash
curl http://localhost:3001/api/completions/daily/2023-10-15
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "c_1634289600000",
      "habitId": "h_1634289600000",
      "date": "2023-10-15",
      "completed": true,
      "value": 30,
      "notes": "Meditated for 30 minutes",
      "createdAt": "2023-10-15T18:00:00.000Z",
      "updatedAt": "2023-10-15T18:00:00.000Z"
    },
    {
      "id": "c_1634289601000",
      "habitId": "h_1634376000000",
      "date": "2023-10-15",
      "completed": true,
      "value": 45,
      "notes": "Weight training",
      "createdAt": "2023-10-15T19:00:00.000Z",
      "updatedAt": "2023-10-15T19:00:00.000Z"
    }
  ],
  "message": "Daily completions retrieved successfully"
}
```

### Get Completions in Range

**Request:**

```bash
curl "http://localhost:3001/api/completions/range?startDate=2023-10-01&endDate=2023-10-31"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "c_1634289600000",
      "habitId": "h_1634289600000",
      "date": "2023-10-15",
      "completed": true,
      "value": 30,
      "notes": "Meditated for 30 minutes",
      "createdAt": "2023-10-15T18:00:00.000Z",
      "updatedAt": "2023-10-15T18:00:00.000Z"
    },
    {
      "id": "c_1634289601000",
      "habitId": "h_1634376000000",
      "date": "2023-10-15",
      "completed": true,
      "value": 45,
      "notes": "Weight training",
      "createdAt": "2023-10-15T19:00:00.000Z",
      "updatedAt": "2023-10-15T19:00:00.000Z"
    }
  ],
  "message": "Completions retrieved successfully"
}
```

### Bulk Complete Habits

**Request:**

```bash
curl -X POST http://localhost:3001/api/completions/bulk \
  -H "Content-Type: application/json" \
  -d '[
    {
      "habitId": "h_1634289600000",
      "date": "2023-10-17",
      "value": 30
    },
    {
      "habitId": "h_1634376000000",
      "date": "2023-10-17",
      "value": 50,
      "notes": "Cardio and strength training"
    }
  ]'
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "c_1634462400000",
      "habitId": "h_1634289600000",
      "date": "2023-10-17",
      "completed": true,
      "value": 30,
      "createdAt": "2023-10-17T18:00:00.000Z",
      "updatedAt": "2023-10-17T18:00:00.000Z"
    },
    {
      "id": "c_1634462400001",
      "habitId": "h_1634376000000",
      "date": "2023-10-17",
      "completed": true,
      "value": 50,
      "notes": "Cardio and strength training",
      "createdAt": "2023-10-17T18:00:00.000Z",
      "updatedAt": "2023-10-17T18:00:00.000Z"
    }
  ],
  "message": "Bulk completion successful"
}
```

## Analytics

### Get Overall Analytics

**Request:**

```bash
curl "http://localhost:3001/api/analytics/overview?startDate=2023-10-01&endDate=2023-10-31"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalHabits": 2,
    "activeHabits": 2,
    "archivedHabits": 0,
    "completionRate": 0.85,
    "completedHabits": 17,
    "totalPossibleHabits": 20,
    "streakStats": {
      "averageStreak": 5.5,
      "maxStreak": 10,
      "habitsWithStreak": 1
    }
  },
  "message": "Overall analytics retrieved successfully"
}
```

### Get Habit Analytics

**Request:**

```bash
curl "http://localhost:3001/api/analytics/habits/h_1634289600000?startDate=2023-10-01&endDate=2023-10-31"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "habitId": "h_1634289600000",
    "habitName": "Morning Meditation",
    "completionRate": 0.9,
    "completedDays": 27,
    "totalPossibleDays": 30,
    "streak": {
      "current": 10,
      "longest": 10,
      "history": [
        { "start": "2023-10-10", "end": "2023-10-19", "length": 10 },
        { "start": "2023-10-21", "end": "2023-10-30", "length": 10 }
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

**Request:**

```bash
curl "http://localhost:3001/api/analytics/trends?startDate=2023-10-01&endDate=2023-10-03&granularity=daily"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "timePoints": ["2023-10-01", "2023-10-02", "2023-10-03"],
    "completionRates": [0.8, 0.9, 0.75],
    "habitData": {
      "h_1634289600000": [true, true, false],
      "h_1634376000000": [true, true, true]
    }
  },
  "message": "Completion trends retrieved successfully"
}
```

### Get Daily Analytics

**Request:**

```bash
curl http://localhost:3001/api/analytics/daily/2023-10-15
```

**Response:**

```json
{
  "success": true,
  "data": {
    "date": "2023-10-15",
    "completionRate": 1.0,
    "completedHabits": 2,
    "totalHabits": 2,
    "habitDetails": [
      {
        "habitId": "h_1634289600000",
        "name": "Morning Meditation",
        "completed": true,
        "value": 30
      },
      {
        "habitId": "h_1634376000000",
        "name": "Exercise",
        "completed": true,
        "value": 45
      }
    ]
  },
  "message": "Daily analytics retrieved successfully"
}
```

### Get Weekly Analytics

**Request:**

```bash
curl http://localhost:3001/api/analytics/weekly/2023-10-15
```

**Response:**

```json
{
  "success": true,
  "data": {
    "startDate": "2023-10-15",
    "endDate": "2023-10-21",
    "completionRate": 0.82,
    "completedHabits": 9,
    "totalHabits": 11,
    "dailyStats": [
      {
        "date": "2023-10-15",
        "completionRate": 1.0
      },
      {
        "date": "2023-10-16",
        "completionRate": 0.5
      },
      {
        "date": "2023-10-17",
        "completionRate": 1.0
      }
    ],
    "habitDetails": [
      {
        "habitId": "h_1634289600000",
        "name": "Morning Meditation",
        "completedDays": 7,
        "possibleDays": 7,
        "completionRate": 1.0
      },
      {
        "habitId": "h_1634376000000",
        "name": "Exercise",
        "completedDays": 2,
        "possibleDays": 4,
        "completionRate": 0.5
      }
    ]
  },
  "message": "Weekly analytics retrieved successfully"
}
```

### Get Monthly Analytics

**Request:**

```bash
curl http://localhost:3001/api/analytics/monthly/2023/10
```

**Response:**

```json
{
  "success": true,
  "data": {
    "year": 2023,
    "month": 10,
    "completionRate": 0.8,
    "completedHabits": 49,
    "totalHabits": 61,
    "weeklyStats": [
      {
        "startDate": "2023-10-01",
        "endDate": "2023-10-07",
        "completionRate": 0.82
      },
      {
        "startDate": "2023-10-08",
        "endDate": "2023-10-14",
        "completionRate": 0.78
      },
      {
        "startDate": "2023-10-15",
        "endDate": "2023-10-21",
        "completionRate": 0.82
      },
      {
        "startDate": "2023-10-22",
        "endDate": "2023-10-28",
        "completionRate": 0.77
      },
      {
        "startDate": "2023-10-29",
        "endDate": "2023-10-31",
        "completionRate": 0.83
      }
    ],
    "habitDetails": [
      {
        "habitId": "h_1634289600000",
        "name": "Morning Meditation",
        "completedDays": 30,
        "possibleDays": 31,
        "completionRate": 0.97
      },
      {
        "habitId": "h_1634376000000",
        "name": "Exercise",
        "completedDays": 19,
        "possibleDays": 30,
        "completionRate": 0.63
      }
    ]
  },
  "message": "Monthly analytics retrieved successfully"
}
```

### Get Day of Week Analysis

**Request:**

```bash
curl "http://localhost:3001/api/analytics/day-of-week?startDate=2023-10-01&endDate=2023-10-31"
```

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

**Request:**

```bash
curl "http://localhost:3001/api/analytics/tags?startDate=2023-10-01&endDate=2023-10-31"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "tagStats": [
      {
        "tag": "wellness",
        "habitCount": 1,
        "completionRate": 0.97,
        "habits": [
          {
            "habitId": "h_1634289600000",
            "name": "Morning Meditation",
            "completionRate": 0.97
          }
        ]
      },
      {
        "tag": "fitness",
        "habitCount": 1,
        "completionRate": 0.63,
        "habits": [
          {
            "habitId": "h_1634376000000",
            "name": "Exercise",
            "completionRate": 0.63
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

**Request:**

```bash
curl http://localhost:3001/api/backup/files
```

**Response:**

```json
{
  "success": true,
  "data": ["habits.json", "completions.json"],
  "message": "Data files retrieved successfully"
}
```

### List Entity Backups

**Request:**

```bash
curl http://localhost:3001/api/backup/entity/habits
```

**Response:**

```json
{
  "success": true,
  "data": ["habits_20231015_120000.json", "habits_20231014_120000.json"],
  "message": "Backups for habits retrieved successfully"
}
```

### List System Backups

**Request:**

```bash
curl http://localhost:3001/api/backup/system
```

**Response:**

```json
{
  "success": true,
  "data": ["backup_20231015_120000.zip", "backup_20231014_120000.zip"],
  "message": "Full system backups retrieved successfully"
}
```

### Create Entity Backup

**Request:**

```bash
curl -X POST http://localhost:3001/api/backup/entity \
  -H "Content-Type: application/json" \
  -d '{
    "entityName": "habits"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": "habits_20231016_120000.json",
  "message": "Backup of habits created successfully"
}
```

### Create System Backup

**Request:**

```bash
curl -X POST http://localhost:3001/api/backup/system
```

**Response:**

```json
{
  "success": true,
  "data": "backup_20231016_120000.zip",
  "message": "Full system backup created successfully"
}
```

### Restore Entity Backup

**Request:**

```bash
curl -X POST http://localhost:3001/api/backup/restore/entity \
  -H "Content-Type: application/json" \
  -d '{
    "entityName": "habits",
    "backupName": "habits_20231015_120000.json"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": "habits_20231015_120000.json",
  "message": "habits restored successfully from backup"
}
```

### Restore System Backup

**Request:**

```bash
curl -X POST http://localhost:3001/api/backup/restore/system \
  -H "Content-Type: application/json" \
  -d '{
    "backupName": "backup_20231015_120000.zip"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": true,
  "message": "System restored successfully from backup"
}
```

### Clean Up Entity Backups

**Request:**

```bash
curl -X POST http://localhost:3001/api/backup/cleanup/entity \
  -H "Content-Type: application/json" \
  -d '{
    "entityName": "habits",
    "keepCount": 5
  }'
```

**Response:**

```json
{
  "success": true,
  "data": 3,
  "message": "Cleaned up old backups for habits, kept the 5 most recent"
}
```
