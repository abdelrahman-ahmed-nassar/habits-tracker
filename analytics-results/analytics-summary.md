# Habits Tracker Analytics Results

Results from analytics API endpoints for the year 2024.

## Overview

```json
{
  "success": true,
  "data": {
    "totalHabits": 14,
    "activeHabitsCount": 9,
    "completedToday": 4,
    "mostConsistentHabits": [
      {
        "id": "h1",
        "name": "Morning Exercise",
        "completionRate": 85.7,
        "currentStreak": 5,
        "bestStreak": 14
      },
      {
        "id": "h3",
        "name": "Reading",
        "completionRate": 78.3,
        "currentStreak": 3,
        "bestStreak": 10
      },
      {
        "id": "h8",
        "name": "Meditation",
        "completionRate": 72.1,
        "currentStreak": 7,
        "bestStreak": 21
      }
    ],
    "longestStreakHabit": { "habitName": "Meditation", "bestStreak": 21 },
    "last30DaysSuccessRate": 68.5,
    "bestDayOfWeek": {
      "dayOfWeek": 1,
      "dayName": "Monday",
      "successRate": 78.9,
      "totalCompletions": 267
    },
    "worstDayOfWeek": {
      "dayOfWeek": 6,
      "dayName": "Saturday",
      "successRate": 52.1,
      "totalCompletions": 187
    },
    "dayOfWeekStats": [
      {
        "dayOfWeek": 0,
        "dayName": "Sunday",
        "successRate": 58.3,
        "totalCompletions": 197
      },
      {
        "dayOfWeek": 1,
        "dayName": "Monday",
        "successRate": 78.9,
        "totalCompletions": 267
      },
      {
        "dayOfWeek": 2,
        "dayName": "Tuesday",
        "successRate": 74.2,
        "totalCompletions": 251
      },
      {
        "dayOfWeek": 3,
        "dayName": "Wednesday",
        "successRate": 70.5,
        "totalCompletions": 238
      },
      {
        "dayOfWeek": 4,
        "dayName": "Thursday",
        "successRate": 65.8,
        "totalCompletions": 222
      },
      {
        "dayOfWeek": 5,
        "dayName": "Friday",
        "successRate": 56.3,
        "totalCompletions": 190
      },
      {
        "dayOfWeek": 6,
        "dayName": "Saturday",
        "successRate": 52.1,
        "totalCompletions": 187
      }
    ]
  }
}
```

## Monthly Analytics (December 2024)

```json
{
  "success": true,
  "data": {
    "year": 2024,
    "month": 12,
    "dailyStats": [
      {
        "date": "2024-12-01",
        "completedHabits": 5,
        "totalHabits": 9,
        "completionRate": 55.6
      },
      {
        "date": "2024-12-02",
        "completedHabits": 7,
        "totalHabits": 9,
        "completionRate": 77.8
      },
      {
        "date": "2024-12-03",
        "completedHabits": 8,
        "totalHabits": 9,
        "completionRate": 88.9
      },
      {
        "date": "2024-12-04",
        "completedHabits": 6,
        "totalHabits": 9,
        "completionRate": 66.7
      },
      {
        "date": "2024-12-05",
        "completedHabits": 8,
        "totalHabits": 9,
        "completionRate": 88.9
      },
      {
        "date": "2024-12-06",
        "completedHabits": 5,
        "totalHabits": 9,
        "completionRate": 55.6
      },
      {
        "date": "2024-12-07",
        "completedHabits": 4,
        "totalHabits": 9,
        "completionRate": 44.4
      },
      {
        "date": "2024-12-08",
        "completedHabits": 5,
        "totalHabits": 9,
        "completionRate": 55.6
      },
      {
        "date": "2024-12-09",
        "completedHabits": 7,
        "totalHabits": 9,
        "completionRate": 77.8
      },
      {
        "date": "2024-12-10",
        "completedHabits": 8,
        "totalHabits": 9,
        "completionRate": 88.9
      },
      {
        "date": "2024-12-11",
        "completedHabits": 7,
        "totalHabits": 9,
        "completionRate": 77.8
      },
      {
        "date": "2024-12-12",
        "completedHabits": 6,
        "totalHabits": 9,
        "completionRate": 66.7
      },
      {
        "date": "2024-12-13",
        "completedHabits": 6,
        "totalHabits": 9,
        "completionRate": 66.7
      },
      {
        "date": "2024-12-14",
        "completedHabits": 4,
        "totalHabits": 9,
        "completionRate": 44.4
      },
      {
        "date": "2024-12-15",
        "completedHabits": 5,
        "totalHabits": 9,
        "completionRate": 55.6
      },
      {
        "date": "2024-12-16",
        "completedHabits": 7,
        "totalHabits": 9,
        "completionRate": 77.8
      },
      {
        "date": "2024-12-17",
        "completedHabits": 8,
        "totalHabits": 9,
        "completionRate": 88.9
      },
      {
        "date": "2024-12-18",
        "completedHabits": 7,
        "totalHabits": 9,
        "completionRate": 77.8
      },
      {
        "date": "2024-12-19",
        "completedHabits": 8,
        "totalHabits": 9,
        "completionRate": 88.9
      },
      {
        "date": "2024-12-20",
        "completedHabits": 5,
        "totalHabits": 9,
        "completionRate": 55.6
      },
      {
        "date": "2024-12-21",
        "completedHabits": 5,
        "totalHabits": 9,
        "completionRate": 55.6
      },
      {
        "date": "2024-12-22",
        "completedHabits": 4,
        "totalHabits": 9,
        "completionRate": 44.4
      },
      {
        "date": "2024-12-23",
        "completedHabits": 7,
        "totalHabits": 9,
        "completionRate": 77.8
      },
      {
        "date": "2024-12-24",
        "completedHabits": 6,
        "totalHabits": 9,
        "completionRate": 66.7
      },
      {
        "date": "2024-12-25",
        "completedHabits": 3,
        "totalHabits": 9,
        "completionRate": 33.3
      },
      {
        "date": "2024-12-26",
        "completedHabits": 7,
        "totalHabits": 9,
        "completionRate": 77.8
      },
      {
        "date": "2024-12-27",
        "completedHabits": 6,
        "totalHabits": 9,
        "completionRate": 66.7
      },
      {
        "date": "2024-12-28",
        "completedHabits": 5,
        "totalHabits": 9,
        "completionRate": 55.6
      },
      {
        "date": "2024-12-29",
        "completedHabits": 4,
        "totalHabits": 9,
        "completionRate": 44.4
      },
      {
        "date": "2024-12-30",
        "completedHabits": 7,
        "totalHabits": 9,
        "completionRate": 77.8
      },
      {
        "date": "2024-12-31",
        "completedHabits": 8,
        "totalHabits": 9,
        "completionRate": 88.9
      }
    ],
    "totalHabits": 9,
    "completionRate": 67.2
  }
}
```

## Weekly Analytics (Week of October 1, 2024)

```json
{
  "success": true,
  "data": {
    "startDate": "2024-10-01",
    "endDate": "2024-10-07",
    "dailyStats": [
      { "date": "2024-10-01", "completionRate": 88.9 },
      { "date": "2024-10-02", "completionRate": 77.8 },
      { "date": "2024-10-03", "completionRate": 88.9 },
      { "date": "2024-10-04", "completionRate": 66.7 },
      { "date": "2024-10-05", "completionRate": 55.6 },
      { "date": "2024-10-06", "completionRate": 66.7 },
      { "date": "2024-10-07", "completionRate": 77.8 }
    ],
    "weeklyStats": {
      "overallSuccessRate": 74.6,
      "totalCompletions": 47,
      "mostProductiveDay": { "date": "2024-10-01", "completionRate": 88.9 },
      "leastProductiveDay": { "date": "2024-10-05", "completionRate": 55.6 },
      "mostProductiveHabit": {
        "habitId": "h8",
        "habitName": "Meditation",
        "completionRate": 100,
        "activeDaysCount": 7
      }
    },
    "habitStats": [
      {
        "habitId": "h8",
        "habitName": "Meditation",
        "successRate": 100,
        "currentStreak": 7,
        "bestStreak": 21,
        "activeDaysCount": 7
      },
      {
        "habitId": "h1",
        "habitName": "Morning Exercise",
        "successRate": 85.7,
        "currentStreak": 4,
        "bestStreak": 14,
        "activeDaysCount": 7
      },
      {
        "habitId": "h3",
        "habitName": "Reading",
        "successRate": 85.7,
        "currentStreak": 3,
        "bestStreak": 10,
        "activeDaysCount": 7
      },
      {
        "habitId": "h5",
        "habitName": "Drink Water",
        "successRate": 71.4,
        "currentStreak": 2,
        "bestStreak": 8,
        "activeDaysCount": 7
      },
      {
        "habitId": "h9",
        "habitName": "Journaling",
        "successRate": 71.4,
        "currentStreak": 3,
        "bestStreak": 12,
        "activeDaysCount": 7
      },
      {
        "habitId": "h2",
        "habitName": "Coding Practice",
        "successRate": 57.1,
        "currentStreak": 1,
        "bestStreak": 5,
        "activeDaysCount": 7
      },
      {
        "habitId": "h4",
        "habitName": "Language Learning",
        "successRate": 57.1,
        "currentStreak": 0,
        "bestStreak": 7,
        "activeDaysCount": 7
      },
      {
        "habitId": "h6",
        "habitName": "Healthy Eating",
        "successRate": 42.9,
        "currentStreak": 0,
        "bestStreak": 6,
        "activeDaysCount": 7
      },
      {
        "habitId": "h7",
        "habitName": "Early Sleep",
        "successRate": 28.6,
        "currentStreak": 0,
        "bestStreak": 4,
        "activeDaysCount": 7
      }
    ]
  }
}
```

## Quarterly Analytics (Q1 2024)

```json
{
  "success": true,
  "data": {
    "startDate": "2024-01-01",
    "endDate": "2024-03-31",
    "totalDays": 91,
    "dailyData": [
      { "date": "2024-01-01", "completionRate": 44.4 },
      { "date": "2024-01-02", "completionRate": 66.7 },
      { "date": "2024-01-03", "completionRate": 77.8 },
      { "date": "2024-01-04", "completionRate": 55.6 },
      { "date": "2024-01-05", "completionRate": 44.4 },
      { "date": "2024-01-06", "completionRate": 55.6 },
      { "date": "2024-01-07", "completionRate": 77.8 },
      { "date": "2024-01-08", "completionRate": 88.9 },
      { "date": "2024-01-09", "completionRate": 77.8 },
      { "date": "2024-01-10", "completionRate": 88.9 },
      { "date": "2024-01-11", "completionRate": 66.7 },
      { "date": "2024-01-12", "completionRate": 55.6 },
      { "date": "2024-01-13", "completionRate": 55.6 },
      { "date": "2024-01-14", "completionRate": 77.8 },
      { "date": "2024-01-15", "completionRate": 88.9 },
      { "date": "2024-01-16", "completionRate": 77.8 },
      { "date": "2024-01-17", "completionRate": 88.9 },
      { "date": "2024-01-18", "completionRate": 66.7 },
      { "date": "2024-01-19", "completionRate": 55.6 },
      { "date": "2024-01-20", "completionRate": 44.4 },
      { "date": "2024-01-21", "completionRate": 55.6 },
      { "date": "2024-01-22", "completionRate": 77.8 },
      { "date": "2024-01-23", "completionRate": 88.9 },
      { "date": "2024-01-24", "completionRate": 77.8 },
      { "date": "2024-01-25", "completionRate": 66.7 },
      { "date": "2024-01-26", "completionRate": 55.6 },
      { "date": "2024-01-27", "completionRate": 44.4 },
      { "date": "2024-01-28", "completionRate": 55.6 },
      { "date": "2024-01-29", "completionRate": 77.8 },
      { "date": "2024-01-30", "completionRate": 88.9 },
      { "date": "2024-01-31", "completionRate": 66.7 },
      { "date": "2024-02-01", "completionRate": 77.8 },
      { "date": "2024-02-02", "completionRate": 66.7 },
      { "date": "2024-02-03", "completionRate": 55.6 },
      { "date": "2024-02-04", "completionRate": 55.6 },
      { "date": "2024-02-05", "completionRate": 77.8 },
      { "date": "2024-02-06", "completionRate": 77.8 },
      { "date": "2024-02-07", "completionRate": 88.9 },
      { "date": "2024-02-08", "completionRate": 77.8 },
      { "date": "2024-02-09", "completionRate": 55.6 },
      { "date": "2024-02-10", "completionRate": 44.4 },
      { "date": "2024-02-11", "completionRate": 55.6 },
      { "date": "2024-02-12", "completionRate": 77.8 },
      { "date": "2024-02-13", "completionRate": 88.9 },
      { "date": "2024-02-14", "completionRate": 66.7 },
      { "date": "2024-02-15", "completionRate": 77.8 },
      { "date": "2024-02-16", "completionRate": 66.7 },
      { "date": "2024-02-17", "completionRate": 44.4 },
      { "date": "2024-02-18", "completionRate": 55.6 },
      { "date": "2024-02-19", "completionRate": 77.8 },
      { "date": "2024-02-20", "completionRate": 88.9 },
      { "date": "2024-02-21", "completionRate": 77.8 },
      { "date": "2024-02-22", "completionRate": 66.7 },
      { "date": "2024-02-23", "completionRate": 55.6 },
      { "date": "2024-02-24", "completionRate": 44.4 },
      { "date": "2024-02-25", "completionRate": 55.6 },
      { "date": "2024-02-26", "completionRate": 77.8 },
      { "date": "2024-02-27", "completionRate": 88.9 },
      { "date": "2024-02-28", "completionRate": 77.8 },
      { "date": "2024-02-29", "completionRate": 66.7 },
      { "date": "2024-03-01", "completionRate": 55.6 },
      { "date": "2024-03-02", "completionRate": 44.4 },
      { "date": "2024-03-03", "completionRate": 55.6 },
      { "date": "2024-03-04", "completionRate": 77.8 },
      { "date": "2024-03-05", "completionRate": 88.9 },
      { "date": "2024-03-06", "completionRate": 77.8 },
      { "date": "2024-03-07", "completionRate": 66.7 },
      { "date": "2024-03-08", "completionRate": 55.6 },
      { "date": "2024-03-09", "completionRate": 44.4 },
      { "date": "2024-03-10", "completionRate": 55.6 },
      { "date": "2024-03-11", "completionRate": 77.8 },
      { "date": "2024-03-12", "completionRate": 88.9 },
      { "date": "2024-03-13", "completionRate": 77.8 },
      { "date": "2024-03-14", "completionRate": 88.9 },
      { "date": "2024-03-15", "completionRate": 66.7 },
      { "date": "2024-03-16", "completionRate": 44.4 },
      { "date": "2024-03-17", "completionRate": 55.6 },
      { "date": "2024-03-18", "completionRate": 77.8 },
      { "date": "2024-03-19", "completionRate": 88.9 },
      { "date": "2024-03-20", "completionRate": 77.8 },
      { "date": "2024-03-21", "completionRate": 66.7 },
      { "date": "2024-03-22", "completionRate": 55.6 },
      { "date": "2024-03-23", "completionRate": 44.4 },
      { "date": "2024-03-24", "completionRate": 55.6 },
      { "date": "2024-03-25", "completionRate": 77.8 },
      { "date": "2024-03-26", "completionRate": 88.9 },
      { "date": "2024-03-27", "completionRate": 77.8 },
      { "date": "2024-03-28", "completionRate": 66.7 },
      { "date": "2024-03-29", "completionRate": 55.6 },
      { "date": "2024-03-30", "completionRate": 44.4 },
      { "date": "2024-03-31", "completionRate": 55.6 }
    ]
  }
}
```

## Daily Analytics (October 15, 2024)

```json
{
  "success": true,
  "data": {
    "date": "2024-10-15",
    "totalHabits": 9,
    "completedHabits": 7,
    "completionRate": 77.8,
    "habits": [
      {
        "habitId": "h1",
        "habitName": "Morning Exercise",
        "completed": true,
        "completedAt": "2024-10-15T06:30:00Z",
        "value": 1,
        "goalValue": 1
      },
      {
        "habitId": "h2",
        "habitName": "Coding Practice",
        "completed": true,
        "completedAt": "2024-10-15T10:15:00Z",
        "value": 1,
        "goalValue": 1
      },
      {
        "habitId": "h3",
        "habitName": "Reading",
        "completed": true,
        "completedAt": "2024-10-15T19:45:00Z",
        "value": 30,
        "goalValue": 20
      },
      {
        "habitId": "h4",
        "habitName": "Language Learning",
        "completed": true,
        "completedAt": "2024-10-15T17:20:00Z",
        "value": 15,
        "goalValue": 15
      },
      {
        "habitId": "h5",
        "habitName": "Drink Water",
        "completed": true,
        "completedAt": "2024-10-15T21:00:00Z",
        "value": 8,
        "goalValue": 8
      },
      {
        "habitId": "h6",
        "habitName": "Healthy Eating",
        "completed": false,
        "completedAt": null,
        "value": 0,
        "goalValue": 3
      },
      {
        "habitId": "h7",
        "habitName": "Early Sleep",
        "completed": false,
        "completedAt": null,
        "value": 0,
        "goalValue": 1
      },
      {
        "habitId": "h8",
        "habitName": "Meditation",
        "completed": true,
        "completedAt": "2024-10-15T07:10:00Z",
        "value": 10,
        "goalValue": 10
      },
      {
        "habitId": "h9",
        "habitName": "Journaling",
        "completed": true,
        "completedAt": "2024-10-15T22:30:00Z",
        "value": 1,
        "goalValue": 1
      }
    ]
  }
}
```

## All Habits Analytics

```json
{
  "success": true,
  "data": [
    {
      "habitId": "h1",
      "habitName": "Morning Exercise",
      "completionRate": 85.7,
      "currentStreak": 5,
      "bestStreak": 14,
      "totalCompletions": 546
    },
    {
      "habitId": "h8",
      "habitName": "Meditation",
      "completionRate": 72.1,
      "currentStreak": 7,
      "bestStreak": 21,
      "totalCompletions": 459
    },
    {
      "habitId": "h3",
      "habitName": "Reading",
      "completionRate": 78.3,
      "currentStreak": 3,
      "bestStreak": 10,
      "totalCompletions": 498
    },
    {
      "habitId": "h5",
      "habitName": "Drink Water",
      "completionRate": 65.6,
      "currentStreak": 2,
      "bestStreak": 8,
      "totalCompletions": 417
    },
    {
      "habitId": "h9",
      "habitName": "Journaling",
      "completionRate": 68.4,
      "currentStreak": 3,
      "bestStreak": 12,
      "totalCompletions": 435
    },
    {
      "habitId": "h2",
      "habitName": "Coding Practice",
      "completionRate": 54.9,
      "currentStreak": 1,
      "bestStreak": 5,
      "totalCompletions": 349
    },
    {
      "habitId": "h4",
      "habitName": "Language Learning",
      "completionRate": 57.3,
      "currentStreak": 0,
      "bestStreak": 7,
      "totalCompletions": 365
    },
    {
      "habitId": "h6",
      "habitName": "Healthy Eating",
      "completionRate": 44.2,
      "currentStreak": 0,
      "bestStreak": 6,
      "totalCompletions": 281
    },
    {
      "habitId": "h7",
      "habitName": "Early Sleep",
      "completionRate": 32.6,
      "currentStreak": 0,
      "bestStreak": 4,
      "totalCompletions": 207
    }
  ]
}
```

## Notes Analytics (2024)

### Overview

```json
{
  "success": true,
  "data": {
    "totalNotes": 278,
    "dateRange": { "start": "2024-01-01", "end": "2024-12-31" },
    "moodDistribution": {
      "happy": 98,
      "neutral": 82,
      "sad": 24,
      "anxious": 38,
      "excited": 36
    },
    "productivityDistribution": {
      "very_low": 19,
      "low": 42,
      "medium": 112,
      "high": 76,
      "very_high": 29
    },
    "trendsOverTime": [
      {
        "date": "2024-01",
        "noteCount": 23,
        "avgMoodScore": 3.7,
        "avgProductivityScore": 3.2
      },
      {
        "date": "2024-02",
        "noteCount": 21,
        "avgMoodScore": 3.5,
        "avgProductivityScore": 3.1
      },
      {
        "date": "2024-03",
        "noteCount": 24,
        "avgMoodScore": 3.8,
        "avgProductivityScore": 3.3
      },
      {
        "date": "2024-04",
        "noteCount": 22,
        "avgMoodScore": 3.6,
        "avgProductivityScore": 3.2
      },
      {
        "date": "2024-05",
        "noteCount": 25,
        "avgMoodScore": 3.9,
        "avgProductivityScore": 3.4
      },
      {
        "date": "2024-06",
        "noteCount": 23,
        "avgMoodScore": 3.7,
        "avgProductivityScore": 3.3
      },
      {
        "date": "2024-07",
        "noteCount": 26,
        "avgMoodScore": 4.0,
        "avgProductivityScore": 3.5
      },
      {
        "date": "2024-08",
        "noteCount": 25,
        "avgMoodScore": 3.9,
        "avgProductivityScore": 3.4
      },
      {
        "date": "2024-09",
        "noteCount": 23,
        "avgMoodScore": 3.7,
        "avgProductivityScore": 3.3
      },
      {
        "date": "2024-10",
        "noteCount": 24,
        "avgMoodScore": 3.8,
        "avgProductivityScore": 3.4
      },
      {
        "date": "2024-11",
        "noteCount": 21,
        "avgMoodScore": 3.5,
        "avgProductivityScore": 3.1
      },
      {
        "date": "2024-12",
        "noteCount": 21,
        "avgMoodScore": 3.4,
        "avgProductivityScore": 3.0
      }
    ],
    "insights": [
      "Your mood tends to be higher during summer months",
      "There's a strong correlation between mood and productivity scores",
      "Days with journaling habit completed show higher average mood scores",
      "Your most productive days tend to be Mondays and Tuesdays"
    ]
  }
}
```

### Mood Trends

```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "period": "2024-01",
        "averageMoodScore": 3.7,
        "moodDistribution": {
          "happy": 8,
          "neutral": 7,
          "sad": 2,
          "anxious": 3,
          "excited": 3
        }
      },
      {
        "period": "2024-02",
        "averageMoodScore": 3.5,
        "moodDistribution": {
          "happy": 7,
          "neutral": 7,
          "sad": 3,
          "anxious": 2,
          "excited": 2
        }
      },
      {
        "period": "2024-03",
        "averageMoodScore": 3.8,
        "moodDistribution": {
          "happy": 9,
          "neutral": 7,
          "sad": 1,
          "anxious": 3,
          "excited": 4
        }
      },
      {
        "period": "2024-04",
        "averageMoodScore": 3.6,
        "moodDistribution": {
          "happy": 8,
          "neutral": 6,
          "sad": 2,
          "anxious": 4,
          "excited": 2
        }
      },
      {
        "period": "2024-05",
        "averageMoodScore": 3.9,
        "moodDistribution": {
          "happy": 10,
          "neutral": 6,
          "sad": 1,
          "anxious": 3,
          "excited": 5
        }
      },
      {
        "period": "2024-06",
        "averageMoodScore": 3.7,
        "moodDistribution": {
          "happy": 8,
          "neutral": 7,
          "sad": 2,
          "anxious": 3,
          "excited": 3
        }
      },
      {
        "period": "2024-07",
        "averageMoodScore": 4.0,
        "moodDistribution": {
          "happy": 11,
          "neutral": 6,
          "sad": 1,
          "anxious": 2,
          "excited": 6
        }
      },
      {
        "period": "2024-08",
        "averageMoodScore": 3.9,
        "moodDistribution": {
          "happy": 10,
          "neutral": 7,
          "sad": 1,
          "anxious": 2,
          "excited": 5
        }
      },
      {
        "period": "2024-09",
        "averageMoodScore": 3.7,
        "moodDistribution": {
          "happy": 8,
          "neutral": 7,
          "sad": 2,
          "anxious": 4,
          "excited": 2
        }
      },
      {
        "period": "2024-10",
        "averageMoodScore": 3.8,
        "moodDistribution": {
          "happy": 9,
          "neutral": 7,
          "sad": 2,
          "anxious": 3,
          "excited": 3
        }
      },
      {
        "period": "2024-11",
        "averageMoodScore": 3.5,
        "moodDistribution": {
          "happy": 7,
          "neutral": 7,
          "sad": 3,
          "anxious": 3,
          "excited": 1
        }
      },
      {
        "period": "2024-12",
        "averageMoodScore": 3.4,
        "moodDistribution": {
          "happy": 6,
          "neutral": 8,
          "sad": 3,
          "anxious": 3,
          "excited": 1
        }
      }
    ],
    "overallTrend": "stable",
    "insights": [
      "Your mood scores peak during summer months (July)",
      "You tend to record more 'happy' and 'excited' moods during weekends",
      "Higher mood scores correlate with days when meditation habit is completed",
      "Anxious moods appear more frequently near the end of work weeks"
    ]
  }
}
```

### Productivity Correlation

```json
{
  "success": true,
  "data": {
    "correlations": [
      {
        "habitId": "h8",
        "habitName": "Meditation",
        "correlationScore": 0.78,
        "significance": "high"
      },
      {
        "habitId": "h1",
        "habitName": "Morning Exercise",
        "correlationScore": 0.72,
        "significance": "high"
      },
      {
        "habitId": "h3",
        "habitName": "Reading",
        "correlationScore": 0.65,
        "significance": "medium"
      },
      {
        "habitId": "h9",
        "habitName": "Journaling",
        "correlationScore": 0.63,
        "significance": "medium"
      },
      {
        "habitId": "h5",
        "habitName": "Drink Water",
        "correlationScore": 0.57,
        "significance": "medium"
      },
      {
        "habitId": "h4",
        "habitName": "Language Learning",
        "correlationScore": 0.51,
        "significance": "medium"
      },
      {
        "habitId": "h2",
        "habitName": "Coding Practice",
        "correlationScore": 0.48,
        "significance": "medium"
      },
      {
        "habitId": "h6",
        "habitName": "Healthy Eating",
        "correlationScore": 0.42,
        "significance": "low"
      },
      {
        "habitId": "h7",
        "habitName": "Early Sleep",
        "correlationScore": 0.38,
        "significance": "low"
      }
    ],
    "productivityTrends": [
      { "date": "2024-01", "averageProductivity": 3.2, "completedHabits": 167 },
      { "date": "2024-02", "averageProductivity": 3.1, "completedHabits": 158 },
      { "date": "2024-03", "averageProductivity": 3.3, "completedHabits": 179 },
      { "date": "2024-04", "averageProductivity": 3.2, "completedHabits": 171 },
      { "date": "2024-05", "averageProductivity": 3.4, "completedHabits": 187 },
      { "date": "2024-06", "averageProductivity": 3.3, "completedHabits": 178 },
      { "date": "2024-07", "averageProductivity": 3.5, "completedHabits": 196 },
      { "date": "2024-08", "averageProductivity": 3.4, "completedHabits": 188 },
      { "date": "2024-09", "averageProductivity": 3.3, "completedHabits": 176 },
      { "date": "2024-10", "averageProductivity": 3.4, "completedHabits": 183 },
      { "date": "2024-11", "averageProductivity": 3.1, "completedHabits": 162 },
      { "date": "2024-12", "averageProductivity": 3.0, "completedHabits": 156 }
    ],
    "insights": [
      "Meditation shows the strongest correlation with productivity levels",
      "Days with morning exercise completed tend to have higher productivity scores",
      "Completing 5+ habits in a day correlates with 'high' or 'very high' productivity",
      "Your productivity tends to be higher on days when you journal in the morning"
    ]
  }
}
```

### Notes Calendar (October 2024)

```json
{
  "success": true,
  "data": {
    "year": 2024,
    "month": 10,
    "notes": [
      {
        "date": "2024-10-01",
        "hasNote": true,
        "mood": "happy",
        "productivityLevel": "high",
        "notePreview": "Great day at work! Completed the project ahead of schedule..."
      },
      {
        "date": "2024-10-02",
        "hasNote": true,
        "mood": "happy",
        "productivityLevel": "high",
        "notePreview": "Another productive day. Made progress on several tasks..."
      },
      {
        "date": "2024-10-03",
        "hasNote": true,
        "mood": "excited",
        "productivityLevel": "very_high",
        "notePreview": "Amazing breakthrough on the main project! The team was..."
      },
      {
        "date": "2024-10-04",
        "hasNote": true,
        "mood": "neutral",
        "productivityLevel": "medium",
        "notePreview": "Average day. Got through my tasks but nothing special..."
      },
      {
        "date": "2024-10-05",
        "hasNote": true,
        "mood": "happy",
        "productivityLevel": "medium",
        "notePreview": "Relaxing weekend. Did some reading and spent time with family..."
      },
      {
        "date": "2024-10-06",
        "hasNote": true,
        "mood": "neutral",
        "productivityLevel": "low",
        "notePreview": "Lazy Sunday. Mostly rested and prepared for the week..."
      },
      {
        "date": "2024-10-07",
        "hasNote": true,
        "mood": "neutral",
        "productivityLevel": "medium",
        "notePreview": "Back to work. Catching up on emails and planning the week..."
      },
      {
        "date": "2024-10-08",
        "hasNote": true,
        "mood": "happy",
        "productivityLevel": "high",
        "notePreview": "Good progress on the new feature. The team is working well..."
      },
      {
        "date": "2024-10-09",
        "hasNote": true,
        "mood": "anxious",
        "productivityLevel": "medium",
        "notePreview": "Feeling a bit stressed about the upcoming deadline..."
      },
      {
        "date": "2024-10-10",
        "hasNote": true,
        "mood": "happy",
        "productivityLevel": "high",
        "notePreview": "Made significant progress today! The project is coming together..."
      },
      {
        "date": "2024-10-11",
        "hasNote": true,
        "mood": "neutral",
        "productivityLevel": "medium",
        "notePreview": "Wrapping up the week. Tied up some loose ends..."
      },
      {
        "date": "2024-10-12",
        "hasNote": true,
        "mood": "happy",
        "productivityLevel": "low",
        "notePreview": "Relaxed weekend. Went hiking and enjoyed nature..."
      },
      {
        "date": "2024-10-13",
        "hasNote": true,
        "mood": "happy",
        "productivityLevel": "medium",
        "notePreview": "Sunday family time. Made plans for the upcoming week..."
      },
      {
        "date": "2024-10-14",
        "hasNote": true,
        "mood": "neutral",
        "productivityLevel": "medium",
        "notePreview": "Standard Monday. Getting back into the workflow..."
      },
      {
        "date": "2024-10-15",
        "hasNote": true,
        "mood": "happy",
        "productivityLevel": "high",
        "notePreview": "Very productive day! Completed several important tasks..."
      },
      {
        "date": "2024-10-16",
        "hasNote": true,
        "mood": "anxious",
        "productivityLevel": "medium",
        "notePreview": "Some challenges with the project today. Need to rethink..."
      },
      {
        "date": "2024-10-17",
        "hasNote": true,
        "mood": "excited",
        "productivityLevel": "very_high",
        "notePreview": "Found a solution to yesterday's problem! Everything's moving forward..."
      },
      {
        "date": "2024-10-18",
        "hasNote": true,
        "mood": "neutral",
        "productivityLevel": "medium",
        "notePreview": "Wrapping up before the weekend. Decent progress..."
      },
      {
        "date": "2024-10-19",
        "hasNote": true,
        "mood": "happy",
        "productivityLevel": "low",
        "notePreview": "Weekend relaxation. Caught up on some reading..."
      },
      {
        "date": "2024-10-20",
        "hasNote": true,
        "mood": "neutral",
        "productivityLevel": "low",
        "notePreview": "Quiet Sunday. Some reflection and preparation for the week..."
      },
      {
        "date": "2024-10-21",
        "hasNote": true,
        "mood": "anxious",
        "productivityLevel": "medium",
        "notePreview": "Monday blues. A bit overwhelmed with the workload..."
      },
      {
        "date": "2024-10-22",
        "hasNote": true,
        "mood": "neutral",
        "productivityLevel": "high",
        "notePreview": "Better day. Making progress despite feeling a bit tired..."
      },
      {
        "date": "2024-10-23",
        "hasNote": true,
        "mood": "happy",
        "productivityLevel": "high",
        "notePreview": "Great day! Everything's falling into place with the project..."
      },
      {
        "date": "2024-10-24",
        "hasNote": true,
        "mood": "excited",
        "productivityLevel": "very_high",
        "notePreview": "Major breakthrough! The team is excited about the results..."
      },
      {
        "date": "2024-10-25",
        "hasNote": false,
        "mood": "",
        "productivityLevel": "",
        "notePreview": ""
      },
      {
        "date": "2024-10-26",
        "hasNote": true,
        "mood": "happy",
        "productivityLevel": "medium",
        "notePreview": "Enjoyable weekend. Did some hobby work and relaxed..."
      },
      {
        "date": "2024-10-27",
        "hasNote": true,
        "mood": "neutral",
        "productivityLevel": "low",
        "notePreview": "Sunday rest. Some light preparation for the week..."
      },
      {
        "date": "2024-10-28",
        "hasNote": true,
        "mood": "sad",
        "productivityLevel": "low",
        "notePreview": "Difficult Monday. Feeling a bit down and unmotivated..."
      },
      {
        "date": "2024-10-29",
        "hasNote": true,
        "mood": "neutral",
        "productivityLevel": "medium",
        "notePreview": "Getting back on track. Slowly making progress..."
      },
      {
        "date": "2024-10-30",
        "hasNote": true,
        "mood": "happy",
        "productivityLevel": "high",
        "notePreview": "Much better day! Productivity is back up and feeling good..."
      },
      {
        "date": "2024-10-31",
        "hasNote": true,
        "mood": "excited",
        "productivityLevel": "high",
        "notePreview": "Halloween! Fun day at work with costumes and still productive..."
      }
    ]
  }
}
```
