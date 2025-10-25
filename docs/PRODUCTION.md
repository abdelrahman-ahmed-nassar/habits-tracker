# 🚀 Production Build & Deployment Guide

## Quick Start

After any code update, just run:

```bash
pnpm run build:all
```

This single command will:

1. ✅ Build React frontend
2. ✅ Copy build to backend
3. ✅ Build TypeScript backend
4. ✅ Create executables for Windows, macOS, and Linux
5. ✅ Package downloads for landing page (ZIP files)

## What Gets Built

### Backend Executables

Location: `backend/executable/`

- `habits-tracker-backend-win.exe` (Windows)
- `habits-tracker-backend-linux` (Linux)
- `habits-tracker-backend-macos` (macOS)
- `data/` (Initial data folder)
- `README.md` (Usage instructions)

### Landing Page Downloads

Location: `landing/downloads/`

- `modawim-windows.zip` (Complete package for Windows)
- `modawim-macos.zip` (Complete package for macOS)
- `modawim-linux.zip` (Complete package for Linux)

Each ZIP contains:

```
modawim/
├── habits-tracker-backend (or .exe)
├── data/
│   ├── habits.json
│   ├── completions.json
│   ├── notes.json
│   └── ... (all data files)
└── README.md
```

## Deployment Workflow

### 1. Make Your Changes

Edit code in `frontend/` or `backend/` as needed.

### 2. Build Everything

```bash
pnpm run build:all
```

### 3. Test Locally (Optional but Recommended)

```bash
# Test the executable
cd backend\executable
habits-tracker-backend-win.exe

# In another terminal, check if it works
# Visit: http://localhost:3000
```

### 4. Commit and Push

```bash
git add .
git commit -m "Update: [describe your changes]"
git push
```

### 5. Deploy Landing Page to Netlify

**Option A: Automatic (via Netlify)**

- Netlify will automatically deploy when you push to main branch
- Base directory: `landing`
- Publish directory: `.`

**Option B: Manual (via Netlify CLI)**

```bash
cd landing
netlify deploy --prod
```

## File Size Considerations

### Netlify Free Tier Limits

- Max file size: 100MB per file
- Max deploy size: 300 builds/month

### If ZIP Files Are Too Large

Use **GitHub Releases** instead:

1. Create a new release on GitHub:

   ```bash
   # Via GitHub CLI
   gh release create v1.0.0 \
     landing/downloads/modawim-windows.zip \
     landing/downloads/modawim-macos.zip \
     landing/downloads/modawim-linux.zip \
     --title "مداوم v1.0.0" \
     --notes "الإصدار الأول"
   ```

2. Update download links in `landing/index.html`:
   ```html
   <a
     href="https://github.com/abdelrahman-ahmed-nassar/modawim-habits-tracker/releases/latest/download/modawim-windows.zip"
     class="download-btn"
     download
   ></a>
   ```

## Troubleshooting

### Build Fails on Step 1 (Frontend)

```bash
cd frontend
pnpm install
pnpm run build
```

### Build Fails on Step 5 (Backend)

```bash
cd backend
pnpm install
pnpm run build
```

### Build Fails on Step 6 (pkg)

Make sure you have Node 18+ installed:

```bash
node --version  # Should be v18 or higher
```

### Landing Page Downloads Not Created

Run manually:

```bash
cd landing\downloads
prepare-downloads.bat
```

## Production Checklist

Before deploying to users:

- [ ] Run `pnpm run build:all` successfully
- [ ] Test Windows executable locally
- [ ] Verify all ZIP files are created
- [ ] Check ZIP file sizes (should be under 100MB)
- [ ] Test landing page locally (`npx serve landing`)
- [ ] Verify all download links work
- [ ] Add/update screenshot images in `landing/images/`
- [ ] Push to GitHub
- [ ] Deploy to Netlify
- [ ] Test downloads from live site
- [ ] Verify executables work on clean machines

## Directory Structure After Build

```
habits-tracker/
├── backend/
│   ├── dist/              ← Compiled TypeScript
│   ├── build/             ← Frontend build (copied here)
│   └── executable/        ← Ready-to-distribute executables
│       ├── habits-tracker-backend-win.exe
│       ├── habits-tracker-backend-linux
│       ├── habits-tracker-backend-macos
│       ├── data/
│       └── README.md
├── frontend/
│   └── build/             ← Compiled React app
└── landing/
    ├── index.html
    ├── styles.css
    ├── script.js
    ├── images/            ← Add your screenshots here
    └── downloads/         ← Distribution packages
        ├── modawim-windows.zip
        ├── modawim-macos.zip
        └── modawim-linux.zip
```

## Version Management

When releasing a new version:

1. Update version in:

   - `package.json`
   - `backend/package.json`
   - `frontend/package.json`

2. Build and test:

   ```bash
   pnpm run build:all
   ```

3. Create a git tag:

   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

4. Create GitHub Release with the ZIP files

## Performance Tips

### Reduce Executable Size

If executables are too large, consider:

- Removing unused dependencies
- Using production builds only
- Compressing with UPX (not recommended for Node.js executables)

### Optimize Frontend Build

```bash
# Check bundle size
cd frontend
pnpm run build
# Look for large chunks in the output
```

### Optimize Images

Before adding to `landing/images/`:

- Use WebP format for smaller sizes
- Compress PNG files
- Recommended: 1800x900px @ 85% quality
- Target: Under 500KB per image

---

## Quick Reference

```bash
# Full build (after any code change)
pnpm run build:all

# Test executable
cd backend\executable
habits-tracker-backend-win.exe

# Test landing page
cd landing
npx serve .

# Deploy to Netlify
cd landing
netlify deploy --prod

# Create GitHub Release
gh release create v1.0.0 landing/downloads/*.zip
```

---

**You're ready for production! 🎉**

Just remember: After any update, run `pnpm run build:all` and push to deploy.
