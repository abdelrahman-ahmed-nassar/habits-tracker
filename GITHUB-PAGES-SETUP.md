# 🌐 GitHub Pages Setup Guide

## Quick Setup

### 1. Enable GitHub Pages

1. Go to your repository on GitHub: https://github.com/abdelrahman-ahmed-nassar/modawim-habits-tracker
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - **Source**: GitHub Actions
4. Click **Save**

That's it! GitHub Actions will automatically deploy your landing page.

### 2. Verify Deployment

After pushing to main, the landing page will be available at:
**https://abdelrahman-ahmed-nassar.github.io/modawim-habits-tracker/**

## How It Works

The workflow (`.github/workflows/deploy-pages.yml`) automatically:

1. Triggers on push to main branch when `landing/**` files change
2. Uploads the `landing` folder as a Pages artifact
3. Deploys to GitHub Pages

## Manual Deployment

If you prefer manual control:

### Option 1: GitHub Actions (Recommended)

Just push changes to main:

```bash
git add landing/
git commit -m "Update landing page"
git push
```

The workflow runs automatically!

### Option 2: Git Subtree

```bash
git subtree push --prefix landing origin gh-pages
```

## Updating the Landing Page

### After Code Changes

```bash
# 1. Update landing page content
code landing/index.html

# 2. Commit and push
git add landing/
git commit -m "Update landing page: [description]"
git push

# GitHub Actions deploys automatically!
```

### Checking Deployment Status

1. Go to **Actions** tab on GitHub
2. Click on the latest "Deploy Landing Page" workflow
3. See deployment status and URL

## Landing Page URL Structure

```
https://abdelrahman-ahmed-nassar.github.io/modawim-habits-tracker/
│
├── index.html           # Main page
├── styles.css          # Styling
├── script.js           # Interactive features
├── images/             # Screenshots
│   ├── screenshot-*.png
└── favicon/
    └── favicon.ico
```

## Download Links

The landing page uses GitHub Releases for downloads:

```
https://github.com/abdelrahman-ahmed-nassar/modawim-habits-tracker/releases/latest/download/modawim-windows.zip
```

Using `/latest/download/` means users always get the newest version automatically!

## Custom Domain (Optional)

### Setup Custom Domain

1. Buy a domain (e.g., `modawim.app`)
2. Add CNAME record pointing to: `abdelrahman-ahmed-nassar.github.io`
3. In GitHub Settings → Pages → Custom domain: Enter `modawim.app`
4. Wait for DNS propagation (can take 24 hours)
5. Enable "Enforce HTTPS"

### Example CNAME Records

```
Type    Name    Value
CNAME   www     abdelrahman-ahmed-nassar.github.io
CNAME   @       abdelrahman-ahmed-nassar.github.io
```

## Troubleshooting

### Page Not Found (404)

- Check that GitHub Pages is enabled in Settings
- Verify Source is set to "GitHub Actions"
- Wait a few minutes for deployment

### Workflow Failed

- Check Actions tab for error details
- Ensure `landing/` folder exists
- Verify workflow file syntax

### Images Not Loading

- Check image paths are relative (no leading `/`)
- Verify images exist in `landing/images/`
- Check file names match exactly (case-sensitive)

### Downloads Not Working

1. Verify releases exist: https://github.com/abdelrahman-ahmed-nassar/modawim-habits-tracker/releases
2. Check file names:
   - `modawim-windows.zip`
   - `modawim-macos.zip`
   - `modawim-linux.zip`
3. Ensure at least one release is published

## Complete Workflow

```bash
# 1. Update landing page
vim landing/index.html

# 2. Commit
git add landing/
git commit -m "Update landing page"

# 3. Push
git push

# 4. Wait for GitHub Actions (check Actions tab)

# 5. Visit your site!
# https://abdelrahman-ahmed-nassar.github.io/modawim-habits-tracker/
```

## Benefits of GitHub Pages

- ✅ Free hosting
- ✅ HTTPS included
- ✅ Custom domain support
- ✅ Automatic deployments
- ✅ CDN distributed
- ✅ Perfect for static sites

---

**Your landing page is now live and automatically deployed on every push!** 🚀
