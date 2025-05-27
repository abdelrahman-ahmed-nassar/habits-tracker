#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Building Habits Tracker for Electron...\n");

function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: "inherit", cwd });
    console.log("✅ Success\n");
  } catch (error) {
    console.error(`❌ Failed to run: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
}

async function main() {
  const rootDir = process.cwd();
  const frontendDir = path.join(rootDir, "frontend");
  const backendDir = path.join(rootDir, "backend");

  // Ensure we're in the right directory
  if (!fs.existsSync(frontendDir) || !fs.existsSync(backendDir)) {
    console.error(
      "❌ Please run this script from the habits-tracker root directory"
    );
    process.exit(1);
  }

  console.log("📦 Building backend...");
  runCommand("npm run build", backendDir);

  console.log("🎨 Building frontend...");
  runCommand("npm run build", frontendDir);

  console.log("⚡ Building Electron main process...");
  const electronDir = path.join(frontendDir, "electron");
  const distElectronDir = path.join(frontendDir, "dist-electron");

  ensureDir(distElectronDir);
  // Copy Electron files to dist-electron
  const electronFiles = ["main.cjs", "preload.js"];
  electronFiles.forEach((file) => {
    const src = path.join(electronDir, file);
    const dest = path.join(distElectronDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`📋 Copied ${file} to dist-electron`);
    }
  });

  console.log("✅ Build completed successfully!");
  console.log("\nNext steps:");
  console.log(
    '- Run "npm run electron:dev" from frontend directory for development'
  );
  console.log(
    '- Run "npm run electron:pack" from frontend directory to package'
  );
  console.log(
    '- Run "npm run electron:dist" from frontend directory to create installer'
  );
}

main().catch(console.error);
