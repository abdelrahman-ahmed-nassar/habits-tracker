# GitHub Releases Deployment Guide

## When to Use GitHub Releases

Use this method if:

- Your zip files are larger than 100MB
- You want version control for downloads
- You want to keep git repository size small

## Steps

### 1. Install GitHub CLI (One Time)

Download from: https://cli.github.com/

Then login:

```bash
gh auth login
```

### 2. After Building, Deploy to Releases

```bash
# Build everything first
pnpm run build:all

# Deploy to GitHub Releases
deploy-release.bat
```

Enter a version like `v1.0.0` when prompted.

### 3. Update Landing Page Links

If using GitHub Releases, update `landing/index.html`:

```html
<a
  href="https://github.com/abdelrahman-ahmed-nassar/habits-tracker/releases/latest/download/modawim-windows.zip"
  class="download-btn"
  download
>
  <i data-lucide="monitor"></i>
  <span>Windows</span>
</a>

<a
  href="https://github.com/abdelrahman-ahmed-nassar/habits-tracker/releases/latest/download/modawim-macos.zip"
  class="download-btn"
  download
>
  <i data-lucide="laptop"></i>
  <span>macOS</span>
</a>

<a
  href="https://github.com/abdelrahman-ahmed-nassar/habits-tracker/releases/latest/download/modawim-linux.zip"
  class="download-btn"
  download
>
  <i data-lucide="terminal"></i>
  <span>Linux</span>
</a>
```

Using `/latest/download/` will always point to the newest release.

### 4. Push Landing Page Update

```bash
git add landing/index.html
git commit -m "Update download links to GitHub Releases"
git push
```

## Workflow with GitHub Releases

```bash
# 1. Make code changes
# 2. Build
pnpm run build:all

# 3. Deploy to GitHub Releases
deploy-release.bat

# 4. (First time only) Update landing page links to use GitHub URLs
# 5. Push landing page
git push
```

## Benefits

- ✅ No file size limits (GitHub allows up to 2GB per file)
- ✅ Download statistics
- ✅ Version history
- ✅ Users can download previous versions
- ✅ Keeps git repo small

## Comparison

| Method              | Pros                              | Cons                                  |
| ------------------- | --------------------------------- | ------------------------------------- |
| **Git Commit**      | Simple workflow, single push      | Limited to 100MB, increases repo size |
| **GitHub Releases** | No size limits, versioning, stats | Requires manual release creation      |

---

## Recommended Approach

**Check your file sizes first:**

```bash
cd landing\downloads
dir *.zip
```

- **If under 50MB each**: Use Option 1 (commit to git) - simplest
- **If over 50MB each**: Use Option 2 (GitHub Releases) - more scalable

---

Most Node.js executables are 40-60MB, so **Option 1 (committing to git)** is usually fine and much simpler!
