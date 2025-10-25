# Auto-Update System Guide

## Overview

The Habits Tracker app now includes an automatic update system that allows users to update without reinstalling. The app checks for updates on GitHub Releases and can download and apply them automatically.

## How It Works

1. **On App Startup**: The app checks GitHub Releases for a newer version (once per day)
2. **User Notification**: If an update is available, a notification appears in the top-right corner
3. **One-Click Download**: Users click "تحميل الآن" (Download Now) to download the update
4. **Auto-Install on Restart**: When users restart the app, the new version is applied automatically

## For Users

### Update Process

1. When you see the update notification, click **"تحميل الآن"** (Download Now)
2. Wait for the download to complete (you'll see a success message)
3. Close the app completely
4. Start the app again - the new version will be running!

### Manual Update Check

You can always download the latest version from:
https://github.com/abdelrahman-ahmed-nassar/modawim-habits-tracker/releases/latest

## For Developers

### Publishing Updates

1. **Build the app**:

   ```bash
   pnpm run build:all
   ```

2. **Create a GitHub Release**:

   ```bash
   pnpm run deploy:release
   ```

   Enter a version like `v1.0.4` when prompted.

3. **That's it!** Users will automatically be notified of the update.

### Version Numbering

Follow semantic versioning:

- `v1.0.0` → `v1.0.1` (Bug fixes)
- `v1.0.0` → `v1.1.0` (New features)
- `v1.0.0` → `v2.0.0` (Breaking changes)

### Current Version

The current version is stored in `package.json` at the root level:

```json
{
  "version": "1.0.0"
}
```

**IMPORTANT**: Update this version number before creating a release!

### Update Process Flow

```
User opens app
    ↓
Check GitHub Releases API
    ↓
New version available? ─No→ Continue normally
    ↓ Yes
Show update notification
    ↓
User clicks "Download"
    ↓
Download ZIP from GitHub
    ↓
Extract to /updates folder
    ↓
Show "Restart to update"
    ↓
User restarts app
    ↓
App replaces itself with new version
    ↓
Run new version!
```

## API Endpoints

### Check for Updates

```
GET /api/updates/check
```

Response:

```json
{
  "hasUpdate": true,
  "latestVersion": "v1.0.4",
  "downloadUrl": "https://github.com/.../modawim-windows.zip",
  "releaseNotes": "Bug fixes and improvements",
  "currentVersion": "v1.0.3"
}
```

### Download Update

```
POST /api/updates/download
Body: { "downloadUrl": "..." }
```

Response:

```json
{
  "success": true,
  "message": "Update downloaded successfully...",
  "updatePath": "/path/to/update"
}
```

### Get Update Info

```
GET /api/updates/info
```

Response:

```json
{
  "currentVersion": "v1.0.3",
  "lastCheck": "2025-10-25T10:30:00.000Z",
  "shouldCheckForUpdates": false
}
```

## Files Added

### Backend

- `backend/src/services/updateService.ts` - Core update logic
- `backend/src/routes/updateRoutes.ts` - API endpoints

### Frontend

- `frontend/src/components/UpdateNotification.tsx` - Update UI

### Modified Files

- `backend/src/index.ts` - Added update routes
- `frontend/src/App.tsx` - Added UpdateNotification component
- `frontend/src/index.css` - Added animation styles

## Configuration

### GitHub Repository

The app checks this repository for updates:

```
https://github.com/abdelrahman-ahmed-nassar/modawim-habits-tracker
```

This is configured in `backend/src/services/updateService.ts`:

```typescript
private readonly GITHUB_REPO = 'abdelrahman-ahmed-nassar/modawim-habits-tracker';
```

### Update Check Frequency

Updates are checked once per day. This prevents excessive API calls to GitHub.

## Troubleshooting

### Update Not Showing

1. **Check current version**: Make sure `package.json` has the correct version
2. **Check GitHub**: Verify the latest release exists at:
   https://github.com/abdelrahman-ahmed-nassar/modawim-habits-tracker/releases/latest
3. **Check logs**: Look at the backend console for errors

### Download Fails

1. **Check internet connection**
2. **Check GitHub is accessible**
3. **Verify download URLs** in the release assets
4. **Check disk space** for the update files

### Update Doesn't Apply After Restart

1. Make sure the app was completely closed
2. Check the `updates/extracted` folder for the new executable
3. On Windows, check if antivirus is blocking the update
4. Try running as administrator

## Security

- Updates are ONLY downloaded from the official GitHub repository
- All downloads use HTTPS
- Users can verify updates by clicking "التفاصيل" (Details) to see release notes
- The app shows "التحديث آمن ومن المصدر الرسمي" (Update is safe and from official source)

## Platform Support

The auto-update system works on:

- ✅ Windows (tested)
- ✅ macOS (uses `unzip`)
- ✅ Linux (uses `unzip`)

## Notes

- The first time users will still need to download and install manually
- After that, all updates can be done through the app
- Old versions remain available on GitHub Releases
- Users can skip updates if they want (no forced updates)
- Update checking is non-blocking and happens in the background

## Future Improvements

Potential enhancements:

1. Background downloads (download while user works)
2. Auto-restart option (ask user to restart automatically)
3. Rollback feature (revert to previous version)
4. Update changelog viewer (show what's new in-app)
5. Beta channel (opt-in to test versions)
