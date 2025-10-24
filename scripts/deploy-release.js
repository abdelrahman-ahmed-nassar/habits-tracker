#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function log(message, type = "info") {
  const colors = {
    info: "\x1b[36m",
    success: "\x1b[32m",
    error: "\x1b[31m",
    warn: "\x1b[33m",
    reset: "\x1b[0m",
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
}

function exec(command, description) {
  try {
    log(`${description}...`, "info");
    execSync(command, { stdio: "inherit" });
    return true;
  } catch (error) {
    log(`Error: ${description} failed`, "error");
    return false;
  }
}

function checkGitHub() {
  try {
    execSync("gh --version", { stdio: "pipe" });
    return true;
  } catch {
    log("ERROR: GitHub CLI (gh) not found!", "error");
    log("Please install it from: https://cli.github.com/", "warn");
    log("After installation, run: gh auth login", "warn");
    return false;
  }
}

function checkAuth() {
  try {
    execSync("gh auth status", { stdio: "pipe" });
    return true;
  } catch {
    log("ERROR: Not logged in to GitHub!", "error");
    log("Please run: gh auth login", "warn");
    return false;
  }
}

function packageExecutables(version) {
  const tempDir = path.join(process.cwd(), "temp-release");

  // Create temp directories
  log("Creating temporary directories...", "info");
  const platforms = ["windows", "macos", "linux"];
  platforms.forEach((platform) => {
    const dir = path.join(tempDir, `modawim-${platform}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Copy files
  log("Copying executables and data...", "info");
  const backendExec = path.join(process.cwd(), "backend", "executable");

  // Windows
  fs.copyFileSync(
    path.join(backendExec, "habits-tracker-backend-win.exe"),
    path.join(tempDir, "modawim-windows", "habits-tracker-backend.exe")
  );

  // macOS
  fs.copyFileSync(
    path.join(backendExec, "habits-tracker-backend-macos"),
    path.join(tempDir, "modawim-macos", "habits-tracker-backend")
  );

  // Linux
  fs.copyFileSync(
    path.join(backendExec, "habits-tracker-backend-linux"),
    path.join(tempDir, "modawim-linux", "habits-tracker-backend")
  );

  // Copy data and README for all platforms
  platforms.forEach((platform) => {
    const targetDir = path.join(tempDir, `modawim-${platform}`);

    // Copy data folder
    exec(
      `xcopy "${path.join(backendExec, "data")}" "${path.join(
        targetDir,
        "data"
      )}\\" /E /I /Y /Q`,
      `Copying data for ${platform}`
    );

    // Copy README
    fs.copyFileSync(
      path.join(backendExec, "README.md"),
      path.join(targetDir, "README.md")
    );
  });

  // Create ZIP files
  log("Creating ZIP files...", "info");
  platforms.forEach((platform) => {
    const sourceDir = path.join(tempDir, `modawim-${platform}`);
    const zipFile = path.join(tempDir, `modawim-${platform}.zip`);

    try {
      execSync(
        `powershell -command "Compress-Archive -Path '${sourceDir}\\*' -DestinationPath '${zipFile}' -Force"`,
        { stdio: "pipe" }
      );
      log(`✓ Created ${platform} ZIP`, "success");
    } catch (error) {
      log(`Failed to create ${platform} ZIP`, "error");
      throw error;
    }
  });

  return tempDir;
}

function createRelease(version, tempDir) {
  log(`Creating GitHub Release ${version}...`, "info");

  const zipFiles = [
    path.join(tempDir, "modawim-windows.zip"),
    path.join(tempDir, "modawim-macos.zip"),
    path.join(tempDir, "modawim-linux.zip"),
  ];

  const command = [
    "gh release create",
    version,
    ...zipFiles.map((f) => `"${f}"`),
    "--title",
    `"مداوم ${version}"`,
    "--notes",
    `"تطبيق مداوم لتتبع العادات - إصدار ${version}"`,
  ].join(" ");

  try {
    execSync(command, { stdio: "inherit" });
    return true;
  } catch {
    return false;
  }
}

function cleanup(tempDir) {
  log("Cleaning up temporary files...", "info");
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

async function main() {
  console.log("================================");
  log("  Deploying to GitHub Releases", "info");
  console.log("================================\n");

  // Check prerequisites
  if (!checkGitHub() || !checkAuth()) {
    process.exit(1);
  }

  // Get version
  const version = await new Promise((resolve) => {
    rl.question("Enter version (e.g., v1.0.0): ", (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });

  if (!version) {
    log("Version is required!", "error");
    process.exit(1);
  }

  let tempDir;
  try {
    // Package executables
    tempDir = packageExecutables(version);

    // Create release
    if (!createRelease(version, tempDir)) {
      throw new Error("Failed to create release");
    }

    // Success!
    console.log("\n================================");
    log("Release created successfully!", "success");
    console.log("================================\n");

    log("Download URLs:", "info");
    console.log(
      `https://github.com/abdelrahman-ahmed-nassar/modawim-habits-tracker/releases/download/${version}/modawim-windows.zip`
    );
    console.log(
      `https://github.com/abdelrahman-ahmed-nassar/modawim-habits-tracker/releases/download/${version}/modawim-macos.zip`
    );
    console.log(
      `https://github.com/abdelrahman-ahmed-nassar/modawim-habits-tracker/releases/download/${version}/modawim-linux.zip`
    );

    console.log("\n");
    log("The landing page uses /latest/download/ URLs", "info");
    log("so users will always get the newest version automatically!", "info");
  } catch (error) {
    log(`Error: ${error.message}`, "error");
    process.exit(1);
  } finally {
    if (tempDir) {
      cleanup(tempDir);
    }
  }
}

main();
