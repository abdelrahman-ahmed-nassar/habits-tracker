# Habits Tracker API Documentation

## Base URL

All routes are prefixed with `/api`

## Routes

### Habits

- `GET /habits` - Get all habits
- `GET /habits/:id` - Get a specific habit
- `POST /habits` - Create new habit
- `PUT /habits/:id` - Update habit
- `DELETE /habits/:id` - Delete habit
- `GET /habits/:id/records` - Get habit completion records
- `POST /habits/:id/complete` - Mark habit as complete for a date
- `DELETE /habits/:id/complete/:date` - Unmark completion

### Completions

- `GET /completions/date/:date` - Get all completions for a specific date
- `GET /completions/habit/:habitId` - Get completions for a specific habit
- `GET /completions/range/:startDate/:endDate` - Get completions for a date range
- `POST /completions` - Create a new completion
- `POST /completions/toggle` - Toggle a completion
- `DELETE /completions/:habitId/:date` - Delete a completion

### Analytics

- `GET /analytics/overview` - Overall statistics and trends
- `GET /analytics/habits/:id` - Individual habit analytics
- `GET /analytics/daily/:date` - Daily completion analytics
- `GET /analytics/weekly/:startDate` - Weekly analytics
- `GET /analytics/monthly/:year/:month` - Monthly analytics
- `POST /analytics/clear-cache` - Clear analytics cache

### Notes

- `GET /notes` - Get all notes
- `GET /notes/:date` - Get notes for a specific date
- `POST /notes` - Create a new note
- `PUT /notes/:id` - Update a note
- `DELETE /notes/:id` - Delete a note

### Settings

- `GET /settings` - Get current settings
- `PUT /settings` - Update settings

### Options

- `GET /options/moods` - Get all available moods
- `POST /options/moods` - Add a new mood
- `DELETE /options/moods/:mood` - Remove a mood

- `GET /options/productivity-levels` - Get all available productivity levels
- `POST /options/productivity-levels` - Add a new productivity level
- `DELETE /options/productivity-levels/:level` - Remove a productivity level
