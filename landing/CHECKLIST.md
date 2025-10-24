# 📋 Pre-Deployment Checklist

## Before Deploying to Netlify

### 1. Build Executables ⬜

```bash
cd backend
pnpm run build:executable
```

- [ ] Windows executable created
- [ ] macOS executable created
- [ ] Linux executable created

### 2. Prepare Download Packages ⬜

```bash
cd landing\downloads
prepare-downloads.bat
```

- [ ] modawim-windows.zip created
- [ ] modawim-macos.zip created
- [ ] modawim-linux.zip created
- [ ] Zip files are under 100MB each

### 3. Add Screenshot Images ⬜

Add these files to `landing/images/`:

- [ ] screenshot-dashboard.png
- [ ] screenshot-daily.png
- [ ] screenshot-weekly.png
- [ ] screenshot-monthly.png
- [ ] screenshot-yearly.png
- [ ] screenshot-analytics-habits.png
- [ ] screenshot-analytics-journal.png
- [ ] screenshot-notes.png
- [ ] screenshot-motivation.png
- [ ] screenshot-settings.png

### 4. Test Locally ⬜

```bash
cd landing
npx serve .
# Then visit http://localhost:3000
```

- [ ] Open test-downloads.html in browser
- [ ] All download links work
- [ ] All screenshots display
- [ ] Mobile menu works
- [ ] Smooth scrolling works
- [ ] Requirements toggle works

### 5. Update Content (if needed) ⬜

- [ ] Check all Arabic text is correct
- [ ] Verify WhatsApp number: +201003685977
- [ ] Verify email: abdelrahman.ahmed.nassar@gmail.com
- [ ] Verify GitHub link: abdelrahman-ahmed-nassar/modawim-habits-tracker

### 6. Commit to Git ⬜

```bash
git add .
git commit -m "Add landing page with downloads and screenshots"
git push
```

### 7. Deploy to Netlify ⬜

**Option A: Netlify Dashboard**

- [ ] Go to https://app.netlify.com
- [ ] Click "Add new site" → "Import from Git"
- [ ] Select GitHub repository
- [ ] Set base directory: `landing`
- [ ] Set publish directory: `.`
- [ ] Click "Deploy site"

**Option B: Netlify CLI**

```bash
npm install -g netlify-cli
netlify login
cd landing
netlify deploy --prod
```

### 8. Post-Deployment ⬜

- [ ] Site is live
- [ ] Test all download links on live site
- [ ] Test on mobile devices
- [ ] Change site name in Netlify settings
- [ ] (Optional) Add custom domain

### 9. Optional Enhancements ⬜

- [ ] Add Google Analytics
- [ ] Set up GitHub Actions for auto-deployment
- [ ] Create GitHub Releases for large files
- [ ] Add Open Graph image for social sharing
- [ ] Submit to Google Search Console

## Common Issues & Solutions

### Downloads Don't Work

- ✅ Check file paths are correct: `/downloads/modawim-*.zip`
- ✅ Verify `netlify.toml` is in landing folder
- ✅ Check files are actually uploaded to downloads folder

### Files Too Large for Netlify

- ✅ Use GitHub Releases instead
- ✅ Compress executables with UPX
- ✅ Use external hosting (Dropbox, Google Drive)

### Images Not Showing

- ✅ Check image paths: `/images/screenshot-*.png`
- ✅ Verify images are in landing/images folder
- ✅ Check file names match exactly (case-sensitive on Linux)

### Arabic Text Issues

- ✅ Verify UTF-8 encoding in all HTML files
- ✅ Check `lang="ar"` and `dir="rtl"` are set
- ✅ Cairo font is loading from Google Fonts

---

## Ready to Deploy? ✅

When all boxes are checked, you're ready to go live! 🚀

See `DEPLOYMENT.md` for detailed deployment instructions.
