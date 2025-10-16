# Build Instructions for Habits Tracker

This guide explains how to build the complete Habits Tracker desktop application.

## Prerequisites

- Node.js 18+ and pnpm installed
- Windows, macOS, or Linux

## Quick Build

Run this command from the project root:

```cmd
pnpm run build:all
```

Or directly:

```cmd
build-all.bat
```

## What the Build Script Does

1. **Builds React Frontend** (`frontend/`)

   - Runs `pnpm run build` in the frontend directory
   - Creates optimized production build

2. **Renames dist to build**

   - React/Vite outputs to `dist`
   - Renames it to `build` for consistency

3. **Removes old build from backend**

   - Cleans up previous build in `backend/build`

4. **Copies new build to backend**

   - Moves the frontend build to `backend/build`
   - This gets packaged into the executable

5. **Builds TypeScript Backend**

   - Compiles TypeScript to JavaScript
   - Output goes to `backend/dist`

6. **Creates Executables with pkg**

   - Packages everything into standalone executables
   - Creates three files:
     - `habits-tracker-backend-win.exe` (Windows)
     - `habits-tracker-backend-linux` (Linux)
     - `habits-tracker-backend-macos` (macOS)

7. **Sets up Initial Data**
   - Copies `backend/data-initial` to `backend/executable/data`
   - Only if the data folder doesn't exist yet

## Output Location

All executables and distributable files are in:

```
backend/executable/
├── habits-tracker-backend-win.exe
├── habits-tracker-backend-linux
├── habits-tracker-backend-macos
├── README.md
└── data/
    ├── habits.json
    ├── completions.json
    ├── notes.json
    ├── settings.json
    ├── tags.json
    ├── moods.json
    ├── productivity_levels.json
    ├── notes_templates.json
    └── README.md
```

## Manual Build Steps

If you prefer to build manually:

```bash
# 1. Build frontend
cd frontend
pnpm run build
mv dist build

# 2. Copy to backend
cd ../backend
rm -rf build
cp -r ../frontend/build .

# 3. Build backend
pnpm run build

# 4. Create executables
pnpx pkg .

# 5. Setup data (if needed)
cp -r data-initial executable/data
```

## Testing the Build

After building:

```bash
cd backend/executable

# Windows
./habits-tracker-backend-win.exe

# macOS/Linux
chmod +x habits-tracker-backend-macos  # or linux
./habits-tracker-backend-macos         # or linux
```

Then open: http://localhost:5002

## Distribution

To distribute the application:

1. Compress the entire `backend/executable/` folder
2. Share the zip file with users
3. Users extract and run the appropriate executable for their OS

## Troubleshooting

**Build fails at frontend step:**

- Run `pnpm install` in the frontend directory
- Check for TypeScript errors: `pnpm run type-check`

**Build fails at backend step:**

- Run `pnpm install` in the backend directory
- Check for TypeScript errors: `pnpm run type-check`

**pkg fails:**

- Ensure all dependencies are listed in `package.json`
- Check that Node.js version is supported (currently using node18)

**Executable doesn't start:**

- Ensure the `data` folder exists next to the executable
- Check file permissions (especially on macOS/Linux)
- On macOS: Right-click → Open (to bypass security warnings)

## Development vs Production

**Development:**

```bash
# Frontend (port 5173)
cd frontend && pnpm run dev

# Backend (port 5002)
cd backend && pnpm run dev
```

**Production:**

- Run the executable from `backend/executable/`
- Everything runs on a single port (5002)
- No separate frontend server needed

## Clean Build

To do a completely clean build:

```bash
# Remove all node_modules and builds
rm -rf frontend/node_modules frontend/dist frontend/build
rm -rf backend/node_modules backend/dist backend/build backend/executable

# Reinstall and rebuild
cd frontend && pnpm install
cd ../backend && pnpm install
cd .. && pnpm run build:all
```

## Notes

- The build process takes 2-5 minutes depending on your system
- Executables are ~45-65 MB each (includes Node.js runtime and all dependencies)
- The `data` folder is NOT included in the executable (by design)
- Users can modify the data folder independently of the application
