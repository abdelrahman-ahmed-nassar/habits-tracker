/**
 * Standalone electron-builder configuration
 * This gives more control over the build process
 */

module.exports = {
  appId: "com.habitsTracker.app",
  productName: "HabitsTracker",
  directories: {
    output: "electron-build",
    buildResources: "electron-builder-resources",
  },
  icon: "electron-builder-resources/icon.png",
  files: [
    "dist/**/*",
    "dist-electron/**/*",
    "node_modules/**/*",
    "!node_modules/.cache",
    "!node_modules/electron-builder/**/*",
  ],
  extraResources: [
    {
      from: "../backend/dist",
      to: "backend",
      filter: ["**/*"],
    },
    {
      from: "../backend/data",
      to: "backend/data",
      filter: ["**/*"],
    },
    {
      from: "../backend/package.json",
      to: "backend/package.json",
    },
  ],
  win: {
    target: [
      {
        target: "nsis",
        arch: ["x64"],
      },
    ],
  },
  mac: {
    target: [
      {
        target: "dmg",
        arch: ["x64", "arm64"],
      },
    ],
    category: "public.app-category.productivity",
  },
  linux: {
    target: [
      {
        target: "AppImage",
        arch: ["x64"],
      },
    ],
    category: "Office",
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
  },
};
