#!/usr/bin/env node

/**
 * Port updater script for Habits Tracker
 * Updates all references to the old port with the new port
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const OLD_PORT = "5000";
const NEW_PORT = "5002";
const ROOT_DIR = process.cwd();
const FRONTEND_DIR = path.join(ROOT_DIR, "frontend");
const BACKEND_DIR = path.join(ROOT_DIR, "backend");

console.log(`🔄 Updating port references from ${OLD_PORT} to ${NEW_PORT}...`);

// Function to update port references in a file
function updatePortInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const updatedContent = content
      .replace(
        new RegExp(`localhost:${OLD_PORT}`, "g"),
        `localhost:${NEW_PORT}`
      )
      .replace(
        new RegExp(`PORT: ["']${OLD_PORT}["']`, "g"),
        `PORT: "${NEW_PORT}"`
      )
      .replace(new RegExp(`port ${OLD_PORT}`, "g"), `port ${NEW_PORT}`)
      .replace(
        new RegExp(`waitForPort\\(${OLD_PORT}\\)`, "g"),
        `waitForPort(${NEW_PORT})`
      )
      .replace(new RegExp(`PORT=${OLD_PORT}`, "g"), `PORT=${NEW_PORT}`);

    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`✅ Updated: ${path.relative(ROOT_DIR, filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(
      `❌ Error updating ${path.relative(ROOT_DIR, filePath)}: ${error.message}`
    );
    return false;
  }
}

// Process frontend service files
const serviceDir = path.join(FRONTEND_DIR, "src", "services");
if (fs.existsSync(serviceDir)) {
  const serviceFiles = fs
    .readdirSync(serviceDir)
    .filter((f) => f.endsWith(".ts"));
  console.log(`\nProcessing ${serviceFiles.length} frontend service files...`);

  let serviceUpdated = 0;
  for (const file of serviceFiles) {
    if (updatePortInFile(path.join(serviceDir, file))) {
      serviceUpdated++;
    }
  }

  console.log(`Updated ${serviceUpdated} frontend service files`);
}

// Process Electron files
const electronDir = path.join(FRONTEND_DIR, "electron");
if (fs.existsSync(electronDir)) {
  const electronFiles = fs
    .readdirSync(electronDir)
    .filter((f) => f.endsWith(".js") || f.endsWith(".cjs"));
  console.log(`\nProcessing ${electronFiles.length} Electron files...`);

  let electronUpdated = 0;
  for (const file of electronFiles) {
    if (updatePortInFile(path.join(electronDir, file))) {
      electronUpdated++;
    }
  }

  console.log(`Updated ${electronUpdated} Electron files`);
}

// Process dist-electron files if they exist
const distElectronDir = path.join(FRONTEND_DIR, "dist-electron");
if (fs.existsSync(distElectronDir)) {
  const distElectronFiles = fs
    .readdirSync(distElectronDir)
    .filter((f) => f.endsWith(".js") || f.endsWith(".cjs"));
  console.log(
    `\nProcessing ${distElectronFiles.length} dist-electron files...`
  );

  let distElectronUpdated = 0;
  for (const file of distElectronFiles) {
    if (updatePortInFile(path.join(distElectronDir, file))) {
      distElectronUpdated++;
    }
  }

  console.log(`Updated ${distElectronUpdated} dist-electron files`);
}

// Update backend index file
const backendIndexFile = path.join(BACKEND_DIR, "src", "index.ts");
if (fs.existsSync(backendIndexFile)) {
  console.log("\nProcessing backend index file...");
  if (updatePortInFile(backendIndexFile)) {
    console.log("Updated backend index file");
  }
}

// Update scripts
const scriptDir = ROOT_DIR;
const scriptFiles = fs
  .readdirSync(scriptDir)
  .filter((f) => f.endsWith(".js") || f.endsWith(".bat"));
console.log(`\nProcessing ${scriptFiles.length} script files...`);

let scriptsUpdated = 0;
for (const file of scriptFiles) {
  if (updatePortInFile(path.join(scriptDir, file))) {
    scriptsUpdated++;
  }
}

console.log(`Updated ${scriptsUpdated} script files`);

console.log("\n🚀 Port update completed!");
console.log('Run "node check-ports.js" to verify all references were updated.');
