# Testing Auto-Update System

## Method 1: Simulate Old Version (Quick Test) ⚡

### Step 1: Change version to older

Edit `package.json` in the root:

```json
"version": "1.0.2"  // Change from 1.0.3 to 1.0.2
```

### Step 2: Rebuild with old version

```bash
pnpm run build:all
```

### Step 3: Run the app

```bash
cd backend\executable
modawim-habits-tracker.exe
```

### Step 4: Open the app in browser

Go to http://localhost:5002

### Step 5: Check for update notification

✅ **Expected Result**: You should see a notification in the top-right corner saying:

- "تحديث جديد متاح!" (New update available!)
- Current version: v1.0.2
- New version: v1.0.3

### Step 6: Test download

1. Click "تحميل الآن" (Download Now)
2. Wait for download to complete
3. You should see "تم تحميل التحديث بنجاح!" (Update downloaded successfully!)

### Step 7: Check update files

```bash
cd backend\executable
dir updates
```

You should see:

- `updates/modawim-windows.zip` (downloaded)
- `updates/extracted/` (extracted files)

### Step 8: Restore version

Change `package.json` back to:

```json
"version": "1.0.3"
```

---

## Method 2: Test API Endpoints Directly 🔧

### Check Current Version

```bash
curl http://localhost:5002/api/updates/info
```

Expected response:

```json
{
  "currentVersion": "1.0.2",
  "lastCheck": null,
  "shouldCheckForUpdates": true
}
```

### Check for Updates

```bash
curl http://localhost:5002/api/updates/check
```

Expected response:

```json
{
  "hasUpdate": true,
  "latestVersion": "v1.0.3",
  "downloadUrl": "https://github.com/.../modawim-windows.zip",
  "releaseNotes": "...",
  "currentVersion": "1.0.2"
}
```

### Test Download (optional)

```bash
curl -X POST http://localhost:5002/api/updates/download \
  -H "Content-Type: application/json" \
  -d "{\"downloadUrl\":\"https://github.com/abdelrahman-ahmed-nassar/modawim-habits-tracker/releases/download/v1.0.3/modawim-windows.zip\"}"
```

---

## Method 3: Create Test Release (Full Test) 🚀

### Step 1: Create a test version

Change `package.json`:

```json
"version": "1.0.4"
```

### Step 2: Build

```bash
pnpm run build:all
```

### Step 3: Deploy test release

```bash
pnpm run deploy:release
```

Enter version: `v1.0.4-test`

### Step 4: Change back to old version

Edit `package.json`:

```json
"version": "1.0.3"
```

### Step 5: Rebuild with old version

```bash
pnpm run build:all
```

### Step 6: Run and test

The app will now detect `v1.0.4-test` as a newer version!

### Step 7: Clean up

Delete the test release from GitHub after testing.

---

## Testing Checklist ✅

- [ ] Update notification appears when running old version
- [ ] Notification shows correct version numbers
- [ ] "تحميل الآن" button works
- [ ] Download progress shows
- [ ] Success message appears after download
- [ ] Files are created in `updates/` folder
- [ ] "التفاصيل" button opens GitHub release page
- [ ] Can dismiss notification with X button
- [ ] Update check only happens once per day
- [ ] Works on Windows
- [ ] Works on macOS (if testing)
- [ ] Works on Linux (if testing)

---

## Common Issues & Solutions 🔍

### Notification doesn't appear

- Check console logs in browser DevTools (F12)
- Verify GitHub release exists: https://github.com/abdelrahman-ahmed-nassar/modawim-habits-tracker/releases/latest
- Check backend logs for errors

### Download fails

- Check internet connection
- Verify GitHub URL is accessible
- Check antivirus isn't blocking
- Look for errors in backend console

### Wrong version detected

- Clear `backend/executable/data/last-update-check.json`
- Rebuild app
- Restart app

---

## Quick Test Commands

**Windows PowerShell:**

```powershell
# Check if update notification is working
Invoke-WebRequest http://localhost:5002/api/updates/check | ConvertFrom-Json

# Check current version info
Invoke-WebRequest http://localhost:5002/api/updates/info | ConvertFrom-Json
```

**Windows CMD:**

```cmd
REM Just open in browser
start http://localhost:5002/api/updates/check
start http://localhost:5002/api/updates/info
```

---

## Automated Test Script

I've set the version to `1.0.2` for you. Now just:

```bash
# Build with old version
pnpm run build:all

# Run the app
cd backend\executable
modawim-habits-tracker.exe

# Open browser to http://localhost:5002
# You should see the update notification!
```

When done testing, change version back to `1.0.3` in `package.json`.

---

## Expected Behavior

### On First Launch (v1.0.2)

1. App starts
2. Backend checks GitHub for latest release
3. Finds v1.0.3 > v1.0.2
4. Frontend shows notification
5. Saves check time in `data/last-update-check.json`

### On Download Click

1. Downloads ZIP from GitHub
2. Extracts to `updates/extracted/`
3. Shows success message
4. Files ready for next restart

### On Next Restart

1. App detects pending update in `updates/`
2. Creates `apply-update.bat` (Windows)
3. Shows message to restart
4. On close and reopen, new version runs!

---

**Current Status:** Package.json version set to `1.0.2` for testing. Build and run to see the update notification! 🎉
