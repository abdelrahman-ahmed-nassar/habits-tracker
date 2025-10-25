# 🚀 GitHub Releases Deployment - Complete Guide

## Overview

مداوم now uses **GitHub Releases** for distributing executables. This means:

- ✅ No file size limits (GitHub allows up to 2GB)
- ✅ Version tracking and history
- ✅ Download statistics
- ✅ Landing page always points to latest release
- ✅ Users automatically get updates

## Your Complete Workflow

### 1️⃣ Make Code Changes

Edit files in `frontend/` or `backend/` as needed.

### 2️⃣ Build Everything

```bash
pnpm run build:all
```

This creates executables in `backend/executable/`:

- `habits-tracker-backend-win.exe`
- `habits-tracker-backend-linux`
- `habits-tracker-backend-macos`

### 3️⃣ Test Locally

```bash
cd backend\executable
habits-tracker-backend-win.exe
# Visit http://localhost:3000
```

### 4️⃣ Create GitHub Release

```bash
deploy-release.bat
```

Enter version when prompted (e.g., `v1.0.0`)

This will:

- Create a new release on GitHub
- Upload all 3 executables as zip files
- Tag the release with version number

### 5️⃣ Push Landing Page (if changed)

```bash
git add .
git commit -m "Update landing page"
git push
```

Netlify will auto-deploy the landing page.

## First Time Setup

### Install GitHub CLI

1. Download from: https://cli.github.com/
2. Install it
3. Login:
   ```bash
   gh auth login
   ```
   Choose:
   - GitHub.com
   - HTTPS
   - Login with a web browser

## How It Works

### Landing Page Links

The landing page uses `/latest/download/` URLs:

```
https://github.com/abdelrahman-ahmed-nassar/modawim-habits-tracker/releases/latest/download/modawim-windows.zip
```

This **always points to the newest release** automatically!

### Version Management

Each release has a version tag (e.g., v1.0.0):

- Users download from `/latest/` (always newest)
- You can see all versions on GitHub
- Users can download older versions if needed

## Complete Workflow Example

```bash
# 1. Make changes to code
code .

# 2. Build executables
pnpm run build:all

# 3. Test
cd backend\executable
habits-tracker-backend-win.exe
# Test in browser
cd ..\..

# 4. Create release
deploy-release.bat
# Enter: v1.0.0

# 5. Push (if landing page changed)
git add .
git commit -m "Release v1.0.0"
git push
```

## File Structure

```
backend/executable/
├── habits-tracker-backend-win.exe  → Packaged as modawim-windows.zip
├── habits-tracker-backend-linux    → Packaged as modawim-linux.zip
├── habits-tracker-backend-macos    → Packaged as modawim-macos.zip
├── data/                           → Included in all zips
└── README.md                       → Included in all zips
```

Each ZIP file contains:

```
modawim/
├── habits-tracker-backend (or .exe)
├── data/
│   ├── habits.json
│   ├── completions.json
│   └── ... (all data files)
└── README.md
```

## Versioning Guidelines

Use semantic versioning:

- **v1.0.0** - Major release (breaking changes)
- **v1.1.0** - Minor release (new features)
- **v1.0.1** - Patch release (bug fixes)

Example releases:

```bash
# First release
deploy-release.bat → v1.0.0

# Bug fix
deploy-release.bat → v1.0.1

# New feature
deploy-release.bat → v1.1.0

# Major update
deploy-release.bat → v2.0.0
```

## GitHub Release Notes

The script automatically creates Arabic release notes:

```
تطبيق مداوم لتتبع العادات - إصدار v1.0.0
```

You can edit these on GitHub after creation to add:

- What's new
- Bug fixes
- Breaking changes
- Screenshots

## Troubleshooting

### "gh not found"

Install GitHub CLI from https://cli.github.com/

### "Not logged in"

Run: `gh auth login`

### "Release already exists"

Either:

- Delete the release on GitHub first
- Use a new version number

### Downloads not working on landing page

Check that:

1. Release exists on GitHub
2. Files are named exactly:
   - `modawim-windows.zip`
   - `modawim-macos.zip`
   - `modawim-linux.zip`

## Benefits Over Git Commits

| Feature      | Git Commits    | GitHub Releases |
| ------------ | -------------- | --------------- |
| File Size    | 100MB limit    | 2GB limit       |
| Repo Size    | Grows large    | Stays small     |
| Versioning   | Manual tags    | Built-in        |
| Statistics   | No             | Yes             |
| Old Versions | Hard to access | Easy            |

## Landing Page Auto-Updates

Once deployed, users always get the latest version:

- You create release v1.0.1
- Landing page `/latest/` URL automatically points to v1.0.1
- No need to update landing page HTML!

## Quick Reference

```bash
# After code changes:
pnpm run build:all        # Build executables
deploy-release.bat        # Upload to GitHub
git push                  # Update landing page (if needed)
```

That's it! Three commands to deploy everything. 🚀

---

**Your landing page is already configured!**
Just run `deploy-release.bat` after building to create your first release.
