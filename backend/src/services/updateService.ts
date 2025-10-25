import https from "https";
import fs from "fs";
import path from "path";

interface GitHubRelease {
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
    size: number;
  }>;
}

export class UpdateService {
  private readonly GITHUB_REPO =
    "abdelrahman-ahmed-nassar/modawim-habits-tracker";
  private readonly CURRENT_VERSION: string;
  private readonly UPDATE_CHECK_FILE = path.join(
    process.cwd(),
    "data",
    "last-update-check.json"
  );

  constructor(version: string) {
    this.CURRENT_VERSION = version;
  }

  /**
   * Check if a new version is available on GitHub
   */
  async checkForUpdates(): Promise<{
    hasUpdate: boolean;
    latestVersion?: string;
    downloadUrl?: string;
    releaseNotes?: string;
    currentVersion: string;
  }> {
    try {
      const release = await this.getLatestRelease();

      if (!release) {
        return { hasUpdate: false, currentVersion: this.CURRENT_VERSION };
      }

      const latestVersion = release.tag_name;
      const hasUpdate =
        this.compareVersions(latestVersion, this.CURRENT_VERSION) > 0;

      if (!hasUpdate) {
        return { hasUpdate: false, currentVersion: this.CURRENT_VERSION };
      }

      // Get the appropriate download URL for the current platform
      const downloadUrl = this.getDownloadUrlForPlatform(release);

      // Save last check time
      this.saveLastCheckTime();

      return {
        hasUpdate: true,
        latestVersion,
        downloadUrl,
        releaseNotes: release.body,
        currentVersion: this.CURRENT_VERSION,
      };
    } catch (error) {
      console.error("Error checking for updates:", error);
      return { hasUpdate: false, currentVersion: this.CURRENT_VERSION };
    }
  }

  /**
   * Download and install an update
   */
  async downloadAndInstallUpdate(downloadUrl: string): Promise<{
    success: boolean;
    message: string;
    updatePath?: string;
  }> {
    try {
      const updateDir = path.join(process.cwd(), "updates");
      if (!fs.existsSync(updateDir)) {
        fs.mkdirSync(updateDir, { recursive: true });
      }

      const fileName = path.basename(downloadUrl);
      const downloadPath = path.join(updateDir, fileName);

      // Download the update executable directly (no ZIP)
      console.log("Downloading update...");
      await this.downloadFile(downloadUrl, downloadPath);

      console.log("Update downloaded successfully!");

      // On Windows, create the update script immediately
      if (process.platform === "win32") {
        this.createUpdateScript(downloadPath);
      }

      return {
        success: true,
        message:
          "Update downloaded successfully. Close the app and run apply-update.bat to complete the installation.",
        updatePath: downloadPath,
      };
    } catch (error) {
      console.error("Error downloading/installing update:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to download update",
      };
    }
  }

  /**
   * Create Windows update script
   */
  private createUpdateScript(newExecutablePath: string): void {
    const currentExecutable = process.execPath;
    const scriptPath = path.join(
      path.dirname(currentExecutable),
      "apply-update.bat"
    );
    const updateDir = path.dirname(newExecutablePath);

    const script = `@echo off
echo ================================
echo  Applying Modawim Update
echo ================================
echo.
echo Waiting for app to close...
timeout /t 3 /nobreak > nul

REM Backup current executable
echo Creating backup...
copy /Y "${currentExecutable}" "${currentExecutable}.backup" > nul

REM Replace with new version
echo Installing update...
copy /Y "${newExecutablePath}" "${currentExecutable}" > nul

REM Clean up
echo Cleaning up...
rmdir /S /Q "${updateDir}" > nul 2>&1
del "%~f0" > nul 2>&1

echo.
echo ================================
echo  Update Complete!
echo ================================
echo.
echo Starting application...
timeout /t 2 /nobreak > nul
start "" "${currentExecutable}"
`;

    fs.writeFileSync(scriptPath, script, "utf-8");
    console.log(`📝 Update script created at: ${scriptPath}`);
  }

  /**
   * Get the latest release from GitHub
   */
  private async getLatestRelease(): Promise<GitHubRelease | null> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: "api.github.com",
        path: `/repos/${this.GITHUB_REPO}/releases/latest`,
        method: "GET",
        headers: {
          "User-Agent": "Habits-Tracker-App",
          Accept: "application/vnd.github.v3+json",
        },
      };

      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          if (res.statusCode === 200) {
            try {
              const release = JSON.parse(data);
              resolve(release);
            } catch (error) {
              reject(new Error("Failed to parse GitHub response"));
            }
          } else if (res.statusCode === 404) {
            resolve(null); // No releases found
          } else {
            reject(new Error(`GitHub API returned status ${res.statusCode}`));
          }
        });
      });

      req.on("error", (error) => {
        reject(error);
      });

      req.end();
    });
  }

  /**
   * Download a file from a URL
   */
  private async downloadFile(url: string, destination: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(destination);

      https
        .get(url, (response) => {
          if (response.statusCode === 302 || response.statusCode === 301) {
            // Follow redirect
            const redirectUrl = response.headers.location;
            if (redirectUrl) {
              this.downloadFile(redirectUrl, destination)
                .then(resolve)
                .catch(reject);
              return;
            }
          }

          response.pipe(file);

          file.on("finish", () => {
            file.close();
            resolve();
          });
        })
        .on("error", (error) => {
          fs.unlink(destination, () => {}); // Delete the file if download fails
          reject(error);
        });
    });
  }

  /**
   * Compare two semantic versions
   * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
   */
  private compareVersions(v1: string, v2: string): number {
    const clean1 = v1.replace(/^v/, "");
    const clean2 = v2.replace(/^v/, "");

    const parts1 = clean1.split(".").map(Number);
    const parts2 = clean2.split(".").map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const num1 = parts1[i] || 0;
      const num2 = parts2[i] || 0;

      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }

    return 0;
  }

  /**
   * Get the appropriate download URL for the current platform
   */
  private getDownloadUrlForPlatform(
    release: GitHubRelease
  ): string | undefined {
    let fileName: string;

    switch (process.platform) {
      case "win32":
        fileName = "modawim-habits-tracker-win.exe";
        break;
      case "darwin":
        fileName = "modawim-habits-tracker-macos";
        break;
      case "linux":
        fileName = "modawim-habits-tracker-linux";
        break;
      default:
        throw new Error(`Unsupported platform: ${process.platform}`);
    }

    const asset = release.assets.find((asset) => asset.name === fileName);

    return asset?.browser_download_url;
  }

  /**
   * Get the executable name for the current platform
   */
  private getExecutableName(): string {
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
   * Save the last update check time
   */
  private saveLastCheckTime(): void {
    try {
      const data = {
        lastCheck: new Date().toISOString(),
      };
      fs.writeFileSync(this.UPDATE_CHECK_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Failed to save last check time:", error);
    }
  }

  /**
   * Get the last update check time
   */
  getLastCheckTime(): Date | null {
    try {
      if (fs.existsSync(this.UPDATE_CHECK_FILE)) {
        const data = JSON.parse(
          fs.readFileSync(this.UPDATE_CHECK_FILE, "utf-8")
        );
        return new Date(data.lastCheck);
      }
    } catch (error) {
      console.error("Failed to read last check time:", error);
    }
    return null;
  }

  /**
   * Should we check for updates? (Don't check more than once per day)
   */
  shouldCheckForUpdates(): boolean {
    const lastCheck = this.getLastCheckTime();
    if (!lastCheck) return true;

    const dayInMs = 24 * 60 * 60 * 1000;
    return Date.now() - lastCheck.getTime() > dayInMs;
  }
}
