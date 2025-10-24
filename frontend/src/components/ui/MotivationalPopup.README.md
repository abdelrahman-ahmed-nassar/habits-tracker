# Motivational Popup Component

## Overview

A beautiful, animated popup that displays a random habit with its motivation note when users first open the website. This feature helps keep users motivated and engaged with their habits.

## Features

### 🎨 Visual Design

- **Gradient Background**: Beautiful purple-to-blue gradient with blur effect
- **Animated Elements**: Sparkle icon with rotation and scale animations
- **Decorative Elements**: Subtle corner decorations for visual appeal
- **Quote Styling**: Motivation note displayed in a quote-like design with quotation marks
- **Stats Display**: Shows current streak, best streak, and total counter

### ⏰ Display Logic

- **Every Visit**: Shows immediately when user opens or refreshes the website
- **Random Habit**: Fetches a random active habit from the backend on each load
- **No Persistence**: Does not use localStorage or cookies - fresh motivation every time

### 🎭 Animations

- Smooth fade-in/out transitions using Framer Motion
- Spring animation for the modal entrance
- Pulsing sparkle icon that rotates and scales
- Hover effects on the CTA button

### 📱 Responsive Design

- Works on all screen sizes
- Mobile-friendly layout
- RTL (Right-to-Left) support for Arabic text

## Usage

### Basic Implementation

```tsx
import MotivationalPopup from "./components/ui/MotivationalPopup";

function App() {
  return (
    <div>
      {/* Your app content */}
      <MotivationalPopup />
    </div>
  );
}
```

### With Callback

```tsx
<MotivationalPopup onClose={() => console.log("Popup closed")} />
```

## Configuration

### Change API Endpoint

```typescript
const response = await fetch("http://localhost:5002/api/habits/random/pick");
```

### Disable Auto-Show

If you want to control when the popup shows manually, you can add a prop:

```typescript
interface MotivationalPopupProps {
  onClose?: () => void;
  autoShow?: boolean; // Add this prop
}
```

## Component Structure

```
MotivationalPopup
├── Backdrop (blurred gradient)
├── Modal Card
│   ├── Decorative Elements
│   ├── Close Button
│   ├── Content
│   │   ├── Icon & Title
│   │   ├── Habit Name & Tag
│   │   ├── Habit Description
│   │   ├── Motivation Note (styled as quote)
│   │   ├── Stats (Current/Best Streak, Total)
│   │   └── Call-to-Action Button
```

## Styling

### Colors Used

- **Primary**: Purple (`from-purple-600 to-blue-600`)
- **Background**: Gradient from purple to blue
- **Accent**: Border highlights in purple

### Dark Mode Support

Fully supports dark mode with appropriate color adjustments using Tailwind's `dark:` prefix.

## Dependencies

- `framer-motion`: For animations
- `lucide-react`: For icons (Sparkles, X)
- `@shared/types/habit`: For Habit type definitions

## API Integration

### Backend Endpoint

```
GET /api/habits/random/pick
```

### Expected Response

```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "description": "...",
    "motivationNote": "...",
    "tag": "...",
    "currentStreak": 0,
    "bestStreak": 0,
    "currentCounter": 0
  }
}
```

## Tips for Customization

1. **Change the API endpoint**: Update the fetch URL to use a different backend
2. **Add more stats**: Add additional habit properties in the stats section
3. **Customize animations**: Adjust the `framer-motion` animation properties
4. **Change colors**: Update the Tailwind classes for different color schemes
5. **Add sound effects**: Consider adding a subtle sound when the popup appears
6. **Control when to show**: Add conditional logic to show popup only on specific pages

## Accessibility

- Close button clearly visible and labeled
- Keyboard accessible (ESC to close via backdrop click)
- Proper contrast ratios for text readability
- ARIA labels can be added for screen readers

## Performance

- Lazy loads only when conditions are met
- Uses localStorage for efficient checking
- Single API call per display
- Optimized animations with GPU acceleration
