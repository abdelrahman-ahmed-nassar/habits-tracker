#!/bin/bash

echo "=== Testing Habit Management ==="

# Get all habits
echo -e "\nTesting GET /habits"
HABITS_RESPONSE=$(curl -X GET http://localhost:5000/api/habits | cat)
echo "$HABITS_RESPONSE"
echo -e "\n"

# Extract the first habit ID from the response
FIRST_HABIT_ID=$(echo $HABITS_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# Get habit by ID
echo -e "\nTesting GET /habits/:id"
curl -X GET http://localhost:5000/api/habits/$FIRST_HABIT_ID | cat
echo -e "\n"

# Create daily habit
echo -e "\nTesting POST /habits (daily)"
DAILY_HABIT_RESPONSE=$(curl -X POST http://localhost:5000/api/habits \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Daily Exercise",
    "description": "30 minutes workout",
    "tag": "fitness",
    "repetition": "daily",
    "specificDays": [],
    "goalType": "streak",
    "goalValue": 21,
    "motivationNote": "Stay healthy and fit"
  }' | cat)
echo "$DAILY_HABIT_RESPONSE"
echo -e "\n"

# Extract the ID of the newly created daily habit
DAILY_HABIT_ID=$(echo $DAILY_HABIT_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# Create weekly habit
echo -e "\nTesting POST /habits (weekly)"
WEEKLY_HABIT_RESPONSE=$(curl -X POST http://localhost:5000/api/habits \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Weekly Review",
    "description": "Review weekly goals and progress",
    "tag": "productivity",
    "repetition": "weekly",
    "specificDays": [0],
    "goalType": "streak",
    "goalValue": 4,
    "motivationNote": "Stay on track with goals"
  }' | cat)
echo "$WEEKLY_HABIT_RESPONSE"
echo -e "\n"

# Create monthly habit
echo -e "\nTesting POST /habits (monthly)"
MONTHLY_HABIT_RESPONSE=$(curl -X POST http://localhost:5000/api/habits \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monthly Budget Review",
    "description": "Review and plan monthly budget",
    "tag": "finance",
    "repetition": "monthly",
    "specificDays": [1],
    "goalType": "streak",
    "goalValue": 12,
    "motivationNote": "Maintain financial health"
  }' | cat)
echo "$MONTHLY_HABIT_RESPONSE"
echo -e "\n"

# Extract the ID of the newly created monthly habit
MONTHLY_HABIT_ID=$(echo $MONTHLY_HABIT_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# Test archiving a habit
echo -e "\nTesting POST /habits/:id/archive"
curl -X POST http://localhost:5000/api/habits/$MONTHLY_HABIT_ID/archive | cat
echo -e "\n"

# Verify habit is archived by getting it
echo -e "\nVerifying habit is archived"
curl -X GET http://localhost:5000/api/habits/$MONTHLY_HABIT_ID | cat
echo -e "\n"

# Test restoring a habit
echo -e "\nTesting POST /habits/:id/restore"
curl -X POST http://localhost:5000/api/habits/$MONTHLY_HABIT_ID/restore | cat
echo -e "\n"

# Verify habit is restored by getting it
echo -e "\nVerifying habit is restored"
curl -X GET http://localhost:5000/api/habits/$MONTHLY_HABIT_ID | cat
echo -e "\n"

# Update habit
echo -e "\nTesting PUT /habits/:id"
curl -X PUT http://localhost:5000/api/habits/$DAILY_HABIT_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Morning Meditation Updated",
    "goalValue": 60
  }' | cat
echo -e "\n"

echo "=== Testing Completion Tracking ==="

# Get daily completions
echo -e "\nTesting GET /completions/date/2025-05-24"
curl -X GET http://localhost:5000/api/completions/date/2025-05-24 | cat
echo -e "\n"

# Get habit completions
echo -e "\nTesting GET /completions/habit/$DAILY_HABIT_ID"
curl -X GET http://localhost:5000/api/completions/habit/$DAILY_HABIT_ID | cat
echo -e "\n"

# Get completions for date range
echo -e "\nTesting GET /completions/range/2025-05-01/2025-05-31"
curl -X GET http://localhost:5000/api/completions/range/2025-05-01/2025-05-31 | cat
echo -e "\n"

# Mark habit complete
echo -e "\nTesting POST /completions"
curl -X POST http://localhost:5000/api/completions \
  -H "Content-Type: application/json" \
  -d '{
    "habitId": "'$DAILY_HABIT_ID'",
    "date": "2025-05-24",
    "value": 1
  }' | cat
echo -e "\n"

# Toggle completion
echo -e "\nTesting POST /completions/toggle"
curl -X POST http://localhost:5000/api/completions/toggle \
  -H "Content-Type: application/json" \
  -d '{
    "habitId": "'$DAILY_HABIT_ID'",
    "date": "2025-05-24"
  }' | cat
echo -e "\n"

# Delete completion
echo -e "\nTesting DELETE /completions/:habitId/:date"
curl -X DELETE http://localhost:5000/api/completions/$DAILY_HABIT_ID/2025-05-24 | cat
echo -e "\n"

echo "=== Testing Analytics ==="

# Get overall analytics
echo -e "\nTesting GET /analytics/overview"
curl -X GET http://localhost:5000/api/analytics/overview | cat
echo -e "\n"

# Get habit analytics
echo -e "\nTesting GET /analytics/habits/$DAILY_HABIT_ID"
curl -X GET http://localhost:5000/api/analytics/habits/$DAILY_HABIT_ID | cat
echo -e "\n"

# Get daily analytics
echo -e "\nTesting GET /analytics/daily/2025-05-24"
curl -X GET http://localhost:5000/api/analytics/daily/2025-05-24 | cat
echo -e "\n"

# Get weekly analytics
echo -e "\nTesting GET /analytics/weekly/2025-05-20"
curl -X GET http://localhost:5000/api/analytics/weekly/2025-05-20 | cat
echo -e "\n"

# Get monthly analytics
echo -e "\nTesting GET /analytics/monthly/2025/5"
curl -X GET http://localhost:5000/api/analytics/monthly/2025/5 | cat
echo -e "\n"

# Test analytics cache control
echo -e "\nTesting POST /analytics/clear-cache"
curl -X POST http://localhost:5000/api/analytics/clear-cache | cat
echo -e "\n"

# Test analytics cache settings
echo -e "\nTesting PUT /settings (analytics cache)"
curl -X PUT http://localhost:5000/api/settings \
  -H "Content-Type: application/json" \
  -d '{
    "analytics": {
      "cacheEnabled": false,
      "cacheDuration": 10
    }
  }' | cat
echo -e "\n"

# Test analytics with cache disabled
echo -e "\nTesting GET /analytics/overview (with cache disabled)"
curl -X GET http://localhost:5000/api/analytics/overview | cat
echo -e "\n"

# Re-enable analytics cache
echo -e "\nTesting PUT /settings (re-enable analytics cache)"
curl -X PUT http://localhost:5000/api/settings \
  -H "Content-Type: application/json" \
  -d '{
    "analytics": {
      "cacheEnabled": true,
      "cacheDuration": 5
    }
  }' | cat
echo -e "\n"

echo "=== Testing Notes ==="

# Get all notes
echo -e "\nTesting GET /notes"
NOTES_RESPONSE=$(curl -X GET http://localhost:5000/api/notes | cat)
echo "$NOTES_RESPONSE"
echo -e "\n"

# Extract the first note ID from the response
FIRST_NOTE_ID=$(echo $NOTES_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# Get notes for date
echo -e "\nTesting GET /notes/2025-05-24"
curl -X GET http://localhost:5000/api/notes/2025-05-24 | cat
echo -e "\n"

# Test mood options
echo -e "\nTesting GET /options/moods"
curl -X GET http://localhost:5000/api/options/moods | cat
echo -e "\n"

# Test productivity level options
echo -e "\nTesting GET /options/productivity-levels"
curl -X GET http://localhost:5000/api/options/productivity-levels | cat
echo -e "\n"

# Create note with valid mood and productivity level
echo -e "\nTesting POST /notes (with valid mood and productivity level)"
NOTE_RESPONSE=$(curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-05-24",
    "content": "Feeling motivated today!",
    "mood": "Happy",
    "productivityLevel": "High"
  }' | cat)
echo "$NOTE_RESPONSE"
echo -e "\n"

# Extract the ID of the newly created note
NEW_NOTE_ID=$(echo $NOTE_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# Update note with new mood and productivity level
echo -e "\nTesting PUT /notes/:id (update mood and productivity level)"
curl -X PUT http://localhost:5000/api/notes/$NEW_NOTE_ID \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated daily note with new mood",
    "mood": "Motivated",
    "productivityLevel": "Very High"
  }' | cat
echo -e "\n"

# Create note with invalid mood
echo -e "\nTesting POST /notes (with invalid mood)"
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-05-24",
    "content": "Invalid mood test",
    "mood": "InvalidMood",
    "productivityLevel": "High"
  }' | cat
echo -e "\n"

# Create note with invalid productivity level
echo -e "\nTesting POST /notes (with invalid productivity level)"
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-05-24",
    "content": "Invalid productivity level test",
    "mood": "Happy",
    "productivityLevel": "InvalidLevel"
  }' | cat
echo -e "\n"

# Test adding new mood
echo -e "\nTesting POST /options/moods"
curl -X POST http://localhost:5000/api/options/moods \
  -H "Content-Type: application/json" \
  -d '{"mood": "Focused"}' | cat
echo -e "\n"

# Test adding new productivity level
echo -e "\nTesting POST /options/productivity-levels"
curl -X POST http://localhost:5000/api/options/productivity-levels \
  -H "Content-Type: application/json" \
  -d '{"level": "Extreme"}' | cat
echo -e "\n"

# Test removing mood
echo -e "\nTesting DELETE /options/moods/Focused"
curl -X DELETE http://localhost:5000/api/options/moods/Focused | cat
echo -e "\n"

# Test removing productivity level
echo -e "\nTesting DELETE /options/productivity-levels/Extreme"
curl -X DELETE http://localhost:5000/api/options/productivity-levels/Extreme | cat
echo -e "\n"

# Delete note
echo -e "\nTesting DELETE /notes/$NEW_NOTE_ID"
curl -X DELETE http://localhost:5000/api/notes/$NEW_NOTE_ID | cat
echo -e "\n"

echo "=== Testing Settings ==="

# Get current settings
echo -e "\nTesting GET /settings"
curl -X GET http://localhost:5000/api/settings | cat
echo -e "\n"

# Update settings
echo -e "\nTesting PUT /settings"
curl -X PUT http://localhost:5000/api/settings \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "dark",
    "reminderEnabled": true,
    "reminderTime": "09:00",
    "backupEnabled": true,
    "backupFrequency": "daily"
  }' | cat
echo -e "\n"

# Delete habit (cleanup)
echo -e "\nTesting DELETE /habits/$DAILY_HABIT_ID"
curl -X DELETE http://localhost:5000/api/habits/$DAILY_HABIT_ID | cat
echo -e "\n" 