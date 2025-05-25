# Habits Tracker Frontend

A modern React TypeScript application for tracking habits and personal goals.

## Features

- Modern UI with light/dark mode support
- Fully responsive design
- Daily, weekly, and monthly habit tracking
- Analytics and insights
- Notes and journaling
- Settings management

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- React Router
- Axios
- Lucide React (icons)
- date-fns
- Recharts
- clsx

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Project Structure

```
src/
├── components/     # React components
│   ├── ui/        # Reusable UI components
│   ├── layout/    # Layout components
│   └── features/  # Feature-specific components
├── pages/         # Page components
├── hooks/         # Custom hooks
├── services/      # API services
├── types/         # TypeScript types
├── utils/         # Utility functions
└── styles/        # Global styles
```

## API Integration

The frontend integrates with the Habits Tracker API running at `http://localhost:5000/api`. Make sure the API server is running before starting the frontend application.

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

MIT
