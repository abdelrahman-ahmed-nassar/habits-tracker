import fs from "fs";
import path from "path";
import { execSync } from "child_process";

/**
 * Check for pending updates on app startup and apply them
 */
export function applyPendingUpdate(): boolean {
  try {
    const updateDir = path.join(process.cwd(), "updates");
    const extractedDir = path.join(updateDir, "extracted");

    // Check if there's a pending update
    if (!fs.existsSync(extractedDir)) {
      return false;
    }

    console.log("📦 Pending update found, preparing to apply...");

    // Get the executable name for the current platform
    const executableName = getExecutableName();
    const newExecutablePath = path.join(extractedDir, executableName);

    if (!fs.existsSync(newExecutablePath)) {
      console.log("⚠️  Update executable not found, skipping update");
      return false;
    }

    // Get current executable path
    const currentExecutable = process.execPath;
    const currentDir = path.dirname(currentExecutable);

    // On Windows, we need to use a batch script to replace the running executable
    if (process.platform === "win32") {
      createWindowsUpdateScript(
        currentExecutable,
        newExecutablePath,
        extractedDir
      );
      console.log("✅ Update ready - will be applied on next restart");
      return true;
    } else {
      // On Unix systems (macOS, Linux), we can replace the file directly
      // First, backup the current executable
      const backupPath = path.join(currentDir, `${executableName}.backup`);
      if (fs.existsSync(backupPath)) {
        fs.unlinkSync(backupPath);
      }
      fs.copyFileSync(currentExecutable, backupPath);

      // Replace with new executable
      fs.copyFileSync(newExecutablePath, currentExecutable);

      // Set execute permissions
      fs.chmodSync(currentExecutable, 0o755);

      // Copy data folder if it exists in the update
      const updateDataDir = path.join(extractedDir, "data");
      const currentDataDir = path.join(currentDir, "data");

      if (fs.existsSync(updateDataDir) && !fs.existsSync(currentDataDir)) {
        copyDirectory(updateDataDir, currentDataDir);
      }

      // Clean up
      fs.rmSync(updateDir, { recursive: true, force: true });

      console.log("✅ Update applied successfully!");
      return true;
    }
  } catch (error) {
    console.error("❌ Failed to apply update:", error);
    return false;
  }
}

/**
 * Create a Windows batch script that will replace the executable after it exits
 */
function createWindowsUpdateScript(
  currentExecutable: string,
  newExecutablePath: string,
  extractedDir: string
): void {
  const scriptPath = path.join(
    path.dirname(currentExecutable),
    "apply-update.bat"
  );
  const updateBaseDir = path.dirname(extractedDir); // Get the 'updates' folder

  const script = `@echo off
echo Applying update...
timeout /t 2 /nobreak > nul

REM Backup current executable
copy /Y "${currentExecutable}" "${currentExecutable}.backup"

REM Replace with new version
copy /Y "${newExecutablePath}" "${currentExecutable}"

REM Copy data folder if needed (but don't overwrite existing data)
if exist "${path.join(extractedDir, "data")}" (
  if not exist "${path.join(path.dirname(currentExecutable), "data")}" (
    xcopy /E /I /Y "${path.join(extractedDir, "data")}" "${path.join(
    path.dirname(currentExecutable),
    "data"
  )}"
  )
)

REM Clean up
rmdir /S /Q "${updateBaseDir}"
del "%~f0"

echo Update completed! Starting application...
start "" "${currentExecutable}"
`;

  fs.writeFileSync(scriptPath, script, "utf-8");
  console.log(`📝 Update script created at: ${scriptPath}`);
  console.log("💡 To apply update: Close the app and run apply-update.bat");
}

/**
 * Get the executable name for the current platform
 */
function getExecutableName(): string {
  switch (process.platform) {
    case "win32":
      return "modawim-habits-tracker.exe";
    case "darwin":
    case "linux":
      return "modawim-habits-tracker";
    default:
      throw new Error(`Unsupported platform: ${process.platform}`);
  }
}

/**
 * Recursively copy a directory
 */
function copyDirectory(source: string, destination: string): void {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Check if there's an update script waiting to be run (Windows only)
 */
export function checkForUpdateScript(): boolean {
  if (process.platform !== "win32") {
    return false;
  }

  const scriptPath = path.join(
    path.dirname(process.execPath),
    "apply-update.bat"
  );
  return fs.existsSync(scriptPath);
}
