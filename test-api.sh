#!/bin/bash

echo "=== Testing Habit Management ==="

# Get all habits
echo -e "\nTesting GET /habits"
curl -X GET http://localhost:5000/api/habits | cat
echo -e "\n"

# Get habit by ID (using the first habit's ID from previous response)
echo -e "\nTesting GET /habits/:id"
curl -X GET http://localhost:5000/api/habits/677dad62-72a3-4454-b858-3751bf610f7f | cat
echo -e "\n"

# Create daily habit
echo -e "\nTesting POST /habits (daily)"
curl -X POST http://localhost:5000/api/habits \
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
  }' | cat
echo -e "\n"

# Create weekly habit
echo -e "\nTesting POST /habits (weekly)"
curl -X POST http://localhost:5000/api/habits \
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
  }' | cat
echo -e "\n"

# Create monthly habit
echo -e "\nTesting POST /habits (monthly)"
curl -X POST http://localhost:5000/api/habits \
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
  }' | cat
echo -e "\n"

# Update habit
echo -e "\nTesting PUT /habits/:id"
curl -X PUT http://localhost:5000/api/habits/677dad62-72a3-4454-b858-3751bf610f7f \
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
echo -e "\nTesting GET /completions/habit/677dad62-72a3-4454-b858-3751bf610f7f"
curl -X GET http://localhost:5000/api/completions/habit/677dad62-72a3-4454-b858-3751bf610f7f | cat
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
    "habitId": "677dad62-72a3-4454-b858-3751bf610f7f",
    "date": "2025-05-24",
    "value": 1
  }' | cat
echo -e "\n"

# Toggle completion
echo -e "\nTesting POST /completions/toggle"
curl -X POST http://localhost:5000/api/completions/toggle \
  -H "Content-Type: application/json" \
  -d '{
    "habitId": "677dad62-72a3-4454-b858-3751bf610f7f",
    "date": "2025-05-24"
  }' | cat
echo -e "\n"

# Delete completion
echo -e "\nTesting DELETE /completions/:habitId/:date"
curl -X DELETE http://localhost:5000/api/completions/677dad62-72a3-4454-b858-3751bf610f7f/2025-05-24 | cat
echo -e "\n"

echo "=== Testing Analytics ==="

# Get overall analytics
echo -e "\nTesting GET /analytics/overview"
curl -X GET http://localhost:5000/api/analytics/overview | cat
echo -e "\n"

# Get habit analytics
echo -e "\nTesting GET /analytics/habits/677dad62-72a3-4454-b858-3751bf610f7f"
curl -X GET http://localhost:5000/api/analytics/habits/677dad62-72a3-4454-b858-3751bf610f7f | cat
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

echo "=== Testing Notes ==="

# Get all notes
echo -e "\nTesting GET /notes"
curl -X GET http://localhost:5000/api/notes | cat
echo -e "\n"

# Get notes for date
echo -e "\nTesting GET /notes/2025-05-24"
curl -X GET http://localhost:5000/api/notes/2025-05-24 | cat
echo -e "\n"

# Create note
echo -e "\nTesting POST /notes"
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-05-24",
    "content": "Feeling motivated today!",
    "type": "daily"
  }' | cat
echo -e "\n"

# Update note
echo -e "\nTesting PUT /notes/1"
curl -X PUT http://localhost:5000/api/notes/1 \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated daily note",
    "type": "daily"
  }' | cat
echo -e "\n"

# Delete note
echo -e "\nTesting DELETE /notes/1"
curl -X DELETE http://localhost:5000/api/notes/1 | cat
echo -e "\n"

# Delete habit (cleanup)
echo -e "\nTesting DELETE /habits/677dad62-72a3-4454-b858-3751bf610f7f"
curl -X DELETE http://localhost:5000/api/habits/677dad62-72a3-4454-b858-3751bf610f7f | cat
echo -e "\n" 