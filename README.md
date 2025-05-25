# Habits Tracker

A local application for tracking personal habits and analyzing your progress over time.

## Project Structure

The project is divided into three main parts:

- Backend (Node.js with Express and TypeScript)
- Frontend (React with TypeScript)
- Shared types (TypeScript interfaces shared between frontend and backend)

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn

### Installation

1. Clone the repository
2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Install frontend dependencies:

```bash
cd frontend
npm install
```

### Running the Application

#### Backend

```bash
cd backend
npm run dev
```

The server will run on port 5000 by default.

#### Frontend

```bash
cd frontend
npm start
```

The frontend development server will run on port 3000 by default.

## Features

- Create, read, update, and delete habits
- Track habit completion over time
- View analytics about habit consistency
- Add daily notes alongside habit tracking
- Local storage using JSON files (no database required)

## API Endpoints

- `GET /api/habits` - Get all habits
- `POST /api/habits` - Create new habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit
- `GET /api/habits/:id/records` - Get habit completion records
- `POST /api/habits/:id/complete` - Mark habit as complete for a date
- `POST /api/habits/:id/archive` - Archive a habit (make it inactive)
- `POST /api/habits/:id/restore` - Restore a habit (make it active)
- `GET /api/analytics` - Get analytics data
- `GET/POST /api/notes` - Handle daily notes
- `POST /api/backup` - Create a backup of all data

## Backup System

The application includes a backup system that allows you to create backups of your data through the API. Backups are stored in the `data/backups` directory with timestamps in the filename.

### Creating a Backup

To create a backup, send a POST request to `/api/backup`. The response will include:

- Success status
- Timestamp of the backup
- Number of habits, completions, and notes backed up
- The path where the backup was saved

Example response:

```json
{
  "success": true,
  "message": "Backup created successfully",
  "data": {
    "timestamp": "2024-03-14T12:00:00.000Z",
    "habits": 5,
    "completions": 120,
    "notes": 30,
    "backupPath": "data/backups/backup-2024-03-14.json"
  }
}
```

### Backup Settings

You can configure backup settings through the settings API:

- Enable/disable automatic backups
- Set backup frequency (daily, weekly, monthly)

## License

MIT
