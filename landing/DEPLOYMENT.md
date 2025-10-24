# نشر الصفحة على Netlify - Deployment Guide

## الخطوات (Steps)

### 1. تحضير ملفات التحميل (Prepare Download Files)

```bash
cd landing/downloads
prepare-downloads.bat
```

هذا سينشئ 3 ملفات:

- `modawim-windows.zip`
- `modawim-macos.zip`
- `modawim-linux.zip`

### 2. رفع المشروع على GitHub (Push to GitHub)

```bash
cd ../..
git add .
git commit -m "Add landing page with downloads"
git push
```

### 3. النشر على Netlify (Deploy to Netlify)

#### الطريقة الأولى: من موقع Netlify (Via Netlify Dashboard)

1. اذهب إلى [https://app.netlify.com](https://app.netlify.com)
2. اضغط "Add new site" → "Import an existing project"
3. اختر GitHub واختر repository: `habits-tracker`
4. في إعدادات النشر:
   - **Base directory**: `landing`
   - **Build command**: (اتركه فارغاً)
   - **Publish directory**: `.` (نقطة)
5. اضغط "Deploy site"

#### الطريقة الثانية: باستخدام Netlify CLI (Via CLI)

```bash
# تثبيت Netlify CLI
npm install -g netlify-cli

# تسجيل الدخول
netlify login

# النشر
cd landing
netlify deploy --prod
```

### 4. إعدادات بعد النشر (Post-Deployment Settings)

في لوحة تحكم Netlify:

1. **Site settings** → **Change site name**

   - اختر اسم مثل: `modawim` أو `mudawim-habits`
   - سيصبح الرابط: `https://modawim.netlify.app`

2. **Domain settings** (اختياري)
   - يمكنك ربط نطاق خاص مثل `modawim.com`

### 5. التحقق من التحميلات (Verify Downloads)

بعد النشر، تأكد من أن روابط التحميل تعمل:

- `https://your-site.netlify.app/downloads/modawim-windows.zip`
- `https://your-site.netlify.app/downloads/modawim-macos.zip`
- `https://your-site.netlify.app/downloads/modawim-linux.zip`

## ملاحظات مهمة (Important Notes)

### حجم الملفات (File Size)

- Netlify يسمح بملفات حتى 100MB للحساب المجاني
- إذا كانت الملفات أكبر، استخدم:
  - **GitHub Releases**: رفع الملفات هناك والربط بها
  - **Netlify Large Media**: لملفات أكبر
  - **External hosting**: مثل Dropbox أو Google Drive

### البديل: استخدام GitHub Releases

إذا كانت الملفات كبيرة جداً:

1. اذهب إلى GitHub repository
2. اضغط "Releases" → "Create a new release"
3. ارفع ملفات الـ zip
4. احصل على روابط التحميل
5. عدّل `index.html` لاستخدام روابط GitHub:

```html
<a
  href="https://github.com/abdelrahman-ahmed-nassar/habits-tracker/releases/latest/download/modawim-windows.zip"
  class="download-btn"
  download
></a>
```

## البنية النهائية (Final Structure)

```
landing/
├── index.html
├── styles.css
├── script.js
├── netlify.toml
├── downloads/
│   ├── modawim-windows.zip  (لا يُرفع على git)
│   ├── modawim-macos.zip    (لا يُرفع على git)
│   ├── modawim-linux.zip    (لا يُرفع على git)
│   ├── README.md
│   ├── .gitignore
│   └── prepare-downloads.bat
├── images/
│   └── [screenshot images]
└── favicon/
    └── favicon.ico
```

## التحديثات المستقبلية (Future Updates)

عند تحديث الملفات التنفيذية:

```bash
cd landing/downloads
prepare-downloads.bat
netlify deploy --prod
```

أو دع GitHub Actions يتعامل معها تلقائياً!
