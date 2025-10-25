import { Router, Request, Response } from "express";
import { UpdateService } from "../services/updateService";
import { APP_VERSION } from "../../../shared/version";

const router: Router = Router();
const updateService = new UpdateService(APP_VERSION);

/**
 * GET /api/updates/check
 * Check if a new version is available
 */
router.get("/check", async (req, res) => {
  try {
    const updateInfo = await updateService.checkForUpdates();
    res.json(updateInfo);
  } catch (error) {
    console.error("Error checking for updates:", error);
    res.status(500).json({
      hasUpdate: false,
      error: "Failed to check for updates",
      currentVersion: APP_VERSION,
    });
  }
});

/**
 * POST /api/updates/download
 * Download and prepare an update
 */
router.post("/download", async (req, res) => {
  try {
    const { downloadUrl } = req.body;

    if (!downloadUrl) {
      return res.status(400).json({
        success: false,
        message: "Download URL is required",
      });
    }

    const result = await updateService.downloadAndInstallUpdate(downloadUrl);
    res.json(result);
  } catch (error) {
    console.error("Error downloading update:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download update",
    });
  }
});

/**
 * GET /api/updates/info
 * Get current version and last check time
 */
router.get("/info", (req, res) => {
  const lastCheck = updateService.getLastCheckTime();
  const shouldCheck = updateService.shouldCheckForUpdates();

  res.json({
    currentVersion: APP_VERSION,
    lastCheck: lastCheck ? lastCheck.toISOString() : null,
    shouldCheckForUpdates: shouldCheck,
  });
});

export default router;
