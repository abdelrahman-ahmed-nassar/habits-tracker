#!/usr/bin/env node

/**
 * Build script to create a standalone executable for Habits Tracker
 * This script:
 * 1. Builds the backend
 * 2. Builds the frontend
 * 3. Packages both using electron-builder
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Config
const rootDir = process.cwd();
const frontendDir = path.join(rootDir, "frontend");
const backendDir = path.join(rootDir, "backend");

console.log("🚀 Building Habits Tracker as standalone executable...");

// Function to run commands with nice formatting
function runCommand(description, command, directory) {
  console.log(`\n🔷 ${description}...`);
  try {
    execSync(command, {
      cwd: directory || rootDir,
      stdio: "inherit",
      env: { ...process.env },
    });
    console.log(`✅ ${description} - Completed`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} - Failed: ${error.message}`);
    return false;
  }
}

// Ensure all directories exist
if (!fs.existsSync(frontendDir) || !fs.existsSync(backendDir)) {
  console.error("❌ Project structure not found. Run this from habits-tracker root directory.");
  process.exit(1);
}

// Build process
async function buildApp() {
  // Clean previous builds
  if (fs.existsSync(path.join(frontendDir, "electron-build"))) {
    console.log("🧹 Cleaning previous build...");
    if (process.platform === "win32") {
      runCommand("Removing old build", "rmdir /s /q electron-build", frontendDir);
    } else {
      runCommand("Removing old build", "rm -rf electron-build", frontendDir);
    }
  }

  // 1. Build backend
  const backendBuilt = runCommand("Building backend", "npm run build", backendDir);
  if (!backendBuilt) {
    console.error("❌ Failed to build backend. Fix errors and try again.");
    process.exit(1);
  }

  // 2. Build frontend
  const frontendBuilt = runCommand("Building frontend", "npm run build", frontendDir);
  if (!frontendBuilt) {
    console.error("❌ Failed to build frontend. Fix errors and try again.");
    process.exit(1);
  }

  // 3. Prepare electron files
  const electronPrepared = runCommand(
    "Preparing Electron files",
    "npm run prepare:electron",
    frontendDir
  );
  if (!electronPrepared) {
    console.error("❌ Failed to prepare Electron files. Fix errors and try again.");
    process.exit(1);
  }

  // 4. Update port in frontend files
  console.log("\n🔷 Updating API port to 5002 in Electron main process...");
  try {
    // Make sure the port is set to 5002 in main.cjs
    let mainCjsPath = path.join(frontendDir, "dist-electron", "main.cjs");
    if (fs.existsSync(mainCjsPath)) {
      let content = fs.readFileSync(mainCjsPath, "utf8");
      content = content.replace(/PORT: ["']5000["']/g, 'PORT: "5002"');
      content = content.replace(/port 5002/g, 'port 5002');
      fs.writeFileSync(mainCjsPath, content);
      console.log("✅ Updated port in main.cjs");
    } else {
      console.warn("⚠️ Could not find main.cjs to update port");
    }
  } catch (error) {
    console.error("❌ Failed to update port:", error.message);
  }
  // 5. Package with electron-builder
  console.log("\n🔷 Packaging application with electron-builder...");
  try {
    // First make sure electron is properly installed in the frontend directory
    console.log("Ensuring electron is properly installed...");
    execSync("npm install --save-dev electron@latest", {
      cwd: frontendDir,
      stdio: "inherit",
    });
    
    // Use electron-builder directly with explicit paths
    console.log("Building application with electron-builder...");
    execSync("npx electron-builder --config electron-builder.config.js", {
      cwd: frontendDir,
      stdio: "inherit",
      env: {
        ...process.env,
        ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES: "true"
      }
    });
    
    console.log("\n✅ Build successful!");
    
    // Find the executable
    const buildDir = path.join(frontendDir, "electron-build");
    if (fs.existsSync(buildDir)) {
      const files = fs.readdirSync(buildDir);
      const exeFiles = files.filter(f => f.endsWith(".exe"));
      
      if (exeFiles.length > 0) {
        console.log("\n🎉 Your application has been built successfully!");
        console.log(`📦 Executable: ${path.join("frontend", "electron-build", exeFiles[0])}`);
      } else {
        console.log("\n📦 Your application has been built successfully!");
        console.log(`   Check the output files in: ${path.join("frontend", "electron-build")}`);
      }
    }
  } catch (error) {
    console.error(`❌ Packaging failed: ${error.message}`);
    console.log("\n⚠️ The packaging process encountered an error, but this is often related to electron-builder configuration.");
    console.log("You can still run your application using 'Start Habits Tracker.bat'");
  }
}

// Run the build
buildApp().catch(err => {
  console.error("Build failed:", err);
  process.exit(1);
});
