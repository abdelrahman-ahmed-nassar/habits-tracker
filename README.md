# Ultimate Habits Tracker

A local habits tracker application built with React, TypeScript, and Node.js.

## Project Structure

This project is organized as a monorepo with the following structure:

```
ultimate-habits-tracker/
├── packages/
│   ├── backend/       # Node.js + Express backend
│   ├── frontend/      # React + Tailwind frontend
│   └── shared/        # Shared TypeScript types
├── package.json       # Root package.json for monorepo management
└── README.md          # This file
```

## Features

- Habit management with tags, repetition patterns, goals
- Daily/Weekly/Monthly views with completion tracking
- Analytics dashboard with charts and statistics
- Streak system with achievements
- Daily notes and habit motivations
- Settings for habit configuration
- Light/dark theme with responsive design

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development servers: `npm run dev`

### Scripts

- `npm run dev` - Start both backend and frontend in development mode
- `npm run build` - Build both backend and frontend
- `npm run start` - Start both backend and frontend in production mode

## Storage

The application uses local JSON files for storage instead of a database, making it entirely self-contained on your machine.
