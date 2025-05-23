# Ultimate Habits Tracker - Frontend

React + TypeScript + Tailwind CSS frontend for the Ultimate Habits Tracker application.

## Directory Structure

```
src/
├── assets/         # Static assets like images and global styles
│   ├── images/
│   └── styles/
├── components/     # Reusable UI components
│   ├── analytics/  # Analytics-specific components
│   ├── common/     # General purpose components (Button, Card, etc.)
│   ├── habits/     # Habit management components
│   ├── layout/     # Layout components (Header, Sidebar, etc.)
│   ├── notes/      # Notes and motivation components
│   └── settings/   # Settings components
├── contexts/       # React Context providers
├── hooks/          # Custom React hooks
├── pages/          # Page components for routing
├── services/       # API services and data fetching
├── types/          # Local type definitions
└── utils/          # Utility functions
```

## Getting Started

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

## Key Features

- Responsive UI with light/dark theme
- Component-based architecture
- Type-safe development with TypeScript
- State management with React Context
- Tailwind CSS for styling
