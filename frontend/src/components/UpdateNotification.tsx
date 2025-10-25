import { useState, useEffect } from "react";
import { X, Download, RefreshCw } from "lucide-react";

interface UpdateInfo {
  hasUpdate: boolean;
  latestVersion?: string;
  downloadUrl?: string;
  releaseNotes?: string;
  currentVersion: string;
}

export function UpdateNotification() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      const response = await fetch("/api/updates/check");
      const data: UpdateInfo = await response.json();

      if (data.hasUpdate) {
        setUpdateInfo(data);
        setIsVisible(true);
      }
    } catch (error) {
      console.error("Failed to check for updates:", error);
    }
  };

  const handleDownload = async () => {
    if (!updateInfo?.downloadUrl) return;

    setIsDownloading(true);
    try {
      const response = await fetch("/api/updates/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          downloadUrl: updateInfo.downloadUrl,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setDownloadComplete(true);
        // Show success message for 3 seconds then hide
        setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      } else {
        alert(`Update failed: ${result.message}`);
      }
    } catch (error) {
      console.error("Failed to download update:", error);
      alert("Failed to download update. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenReleaseNotes = () => {
    if (updateInfo?.latestVersion) {
      window.open(
        `https://github.com/abdelrahman-ahmed-nassar/modawim-habits-tracker/releases/tag/${updateInfo.latestVersion}`,
        "_blank"
      );
    }
  };

  if (!isVisible || !updateInfo?.hasUpdate) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-in">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-2xl p-4 text-white">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            <h3 className="font-bold text-lg">تحديث جديد متاح!</h3>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-sm text-white/90">
            الإصدار الحالي:{" "}
            <span className="font-mono">{updateInfo.currentVersion}</span>
          </p>
          <p className="text-sm text-white/90">
            الإصدار الجديد:{" "}
            <span className="font-mono font-bold">
              {updateInfo.latestVersion}
            </span>
          </p>
        </div>

        {downloadComplete ? (
          <div className="bg-white/20 rounded-lg p-3 mb-3">
            <p className="text-sm font-medium mb-2">
              ✅ تم تحميل التحديث بنجاح!
            </p>
            <p className="text-xs text-white/90">
              أغلق التطبيق وافتحه مرة أخرى لتطبيق التحديث.
            </p>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 bg-white text-blue-600 hover:bg-blue-50 disabled:bg-gray-300 disabled:text-gray-500 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  جاري التحميل...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  تحميل الآن
                </>
              )}
            </button>
            <button
              onClick={handleOpenReleaseNotes}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              التفاصيل
            </button>
          </div>
        )}

        <p className="text-xs text-white/70 mt-3 text-center">
          التحديث آمن ومن المصدر الرسمي
        </p>
      </div>
    </div>
  );
}
