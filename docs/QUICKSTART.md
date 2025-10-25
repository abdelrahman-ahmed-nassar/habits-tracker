# Quick Start Guide

## Building the Application

Run this command from the project root:

```cmd
pnpm run build:all
```

Or directly:

```cmd
build-all.bat
```

The build process will:

1. ✓ Build React frontend
2. ✓ Rename dist → build
3. ✓ Copy build to backend
4. ✓ Build TypeScript backend
5. ✓ Create executables (Windows, Linux, macOS)
6. ✓ Setup initial data folder

## Result

Find your executables in: `backend/executable/`

## Testing

```bash
cd backend/executable
./habits-tracker-backend-win.exe
```

Open: http://localhost:5002

---

For detailed instructions, see [BUILD.md](BUILD.md)
