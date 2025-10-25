import https from "https";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import AdmZip from "adm-zip";

const execAsync = promisify(exec);

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

      return {
        success: true,
        message:
          "Update downloaded successfully. Please restart the application to complete the installation.",
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
   * Extract a ZIP file using Node.js (no PowerShell needed)
   */
  private async extractZip(
    zipPath: string,
    extractPath: string
  ): Promise<void> {
    if (!fs.existsSync(extractPath)) {
      fs.mkdirSync(extractPath, { recursive: true });
    }

    try {
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(extractPath, true);
      console.log("ZIP extracted successfully");
    } catch (error) {
      console.error("Failed to extract ZIP:", error);
      throw new Error(
        `Failed to extract ZIP file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
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
