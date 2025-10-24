# Downloads Folder

This folder contains the distributable files for مداوم (Modawim) Habits Tracker.

## Quick Start

Run the script to automatically create the zip files:

```bash
prepare-downloads.bat
```

This will generate:

1. **modawim-windows.zip** - Windows executable (habits-tracker-backend.exe + data folder)
2. **modawim-macos.zip** - macOS executable (habits-tracker-backend + data folder)
3. **modawim-linux.zip** - Linux executable (habits-tracker-backend + data folder)

## Preparing the Zip Files

Each zip file should contain:

```
modawim/
  ├── habits-tracker-backend (or .exe for Windows)
  ├── data/
  │   ├── habits.json
  │   ├── completions.json
  │   ├── notes.json
  │   ├── moods.json
  │   ├── productivity_levels.json
  │   ├── tags.json
  │   ├── notes_templates.json
  │   ├── settings.json
  │   └── backups/
  └── README.md (usage instructions)
```

## File Size Recommendations

- Keep each zip file under 50MB for optimal download experience
- Compress executables if needed using UPX or similar tools

## After Adding Files

The download links in `index.html` are configured to point to:

- `/downloads/modawim-windows.zip`
- `/downloads/modawim-macos.zip`
- `/downloads/modawim-linux.zip`

When deployed on Netlify, these will be accessible at:

- `https://your-site.netlify.app/downloads/modawim-windows.zip`
- `https://your-site.netlify.app/downloads/modawim-macos.zip`
- `https://your-site.netlify.app/downloads/modawim-linux.zip`
