# Ultimate Habits Tracker - Shared Types

Shared TypeScript interfaces and types for the Ultimate Habits Tracker application.

## Purpose

This package contains shared TypeScript interfaces that are used by both the frontend and backend packages. This ensures type consistency across the entire application.

## Structure

```
src/
├── index.ts       # Main export file
├── habits.ts      # Habit-related interfaces
├── completions.ts # Completion tracking interfaces
├── notes.ts       # Notes and motivation interfaces
├── analytics.ts   # Analytics data structures
└── settings.ts    # Settings interfaces
```

## Usage

In the backend or frontend package:

```typescript
import { Habit, HabitTag } from "@ultimate-habits-tracker/shared";

// Type-safe habit object
const habit: Habit = {
  id: "123",
  name: "Daily Exercise",
  tag: HabitTag.Health,
  // ...
};
```

## Building

To compile TypeScript to JavaScript:

```bash
npm run build
```
