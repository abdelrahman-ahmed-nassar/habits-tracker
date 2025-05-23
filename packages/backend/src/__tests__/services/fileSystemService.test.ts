import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { FileSystemService } from "../../services/fileSystemService";
import logger from "../../utils/logger";

// Mock fs and path modules
jest.mock("fs/promises");
jest.mock("fs");
jest.mock("path");
jest.mock("../../utils/logger");
jest.mock("../../config/env", () => ({
  DATA_DIR: "/mock/data",
}));

describe("FileSystemService", () => {
  let fileSystemService: FileSystemService;
  const mockBaseDir = "/mock/data";
  const mockBackupDir = "/mock/data/backups";

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks
    (path.join as jest.Mock).mockImplementation((...args) => args.join("/"));
    (fsSync.existsSync as jest.Mock).mockReturnValue(true);

    // Initialize service
    fileSystemService = new FileSystemService(mockBaseDir, mockBackupDir);
  });

  describe("ensureDirectories", () => {
    it("should create directories if they don't exist", () => {
      // Mock directories don't exist
      (fsSync.existsSync as jest.Mock).mockReturnValue(false);

      // Re-initialize to trigger ensureDirectories
      fileSystemService = new FileSystemService(mockBaseDir, mockBackupDir);

      // Check that mkdirSync was called for both directories
      const mockMkdirSync = fsSync.mkdirSync as jest.Mock;
      const mkdirCalls = mockMkdirSync.mock.calls;
      const callCount = mkdirCalls.length;
      const firstCallArgs = mkdirCalls[0];
      const secondCallArgs = mkdirCalls[1];

      expect(callCount).toBe(2);
      expect(firstCallArgs[0]).toBe(mockBaseDir);
      expect(secondCallArgs[0]).toBe(mockBackupDir);

      const mockLogger = logger.info as jest.Mock;
      const loggerCallCount = mockLogger.mock.calls.length;
      expect(loggerCallCount).toBe(2);
    });

    it("should not create directories if they exist", () => {
      // Mock directories exist
      (fsSync.existsSync as jest.Mock).mockReturnValue(true);

      // Re-initialize to trigger ensureDirectories
      fileSystemService = new FileSystemService(mockBaseDir, mockBackupDir);

      // Check that mkdirSync was not called
      const mockMkdirSync = fsSync.mkdirSync as jest.Mock;
      const mkdirCalls = mockMkdirSync.mock.calls;
      expect(mkdirCalls.length).toBe(0);
    });
  });

  describe("readData", () => {
    it("should return empty array if file doesn't exist", async () => {
      // Mock file doesn't exist
      (fs.access as jest.Mock).mockRejectedValue(new Error("File not found"));

      const result = await fileSystemService.readData("test");

      expect(result).toEqual({ success: true, value: [] });
      expect(fs.readFile).not.toHaveBeenCalled();
    });

    it("should read and parse JSON data successfully", async () => {
      // Mock file exists
      (fs.access as jest.Mock).mockResolvedValue(undefined);
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ test: "data" })
      );

      const result = await fileSystemService.readData("test");

      expect(result).toEqual({
        success: true,
        value: { test: "data" },
      });
      expect(fs.readFile).toHaveBeenCalledWith("/mock/data/test.json", "utf8");
    });

    it("should handle JSON parse errors", async () => {
      // Mock file exists but contains invalid JSON
      (fs.access as jest.Mock).mockResolvedValue(undefined);
      (fs.readFile as jest.Mock).mockResolvedValue("invalid JSON");

      const result = await fileSystemService.readData("test");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid JSON");
      expect(logger.error).toHaveBeenCalled();
    });

    it("should handle file read errors", async () => {
      // Mock file access succeeds but read fails
      (fs.access as jest.Mock).mockResolvedValue(undefined);
      (fs.readFile as jest.Mock).mockRejectedValue(new Error("Read failed"));

      const result = await fileSystemService.readData("test");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Failed to read");
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("writeData", () => {
    it("should write data successfully", async () => {
      // Mock successful lock and write operations
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fs.rename as jest.Mock).mockResolvedValue(undefined);

      const testData = { test: "data" };
      const result = await fileSystemService.writeData("test", testData);

      expect(result).toEqual({
        success: true,
        value: testData,
      });
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining(".tmp"),
        JSON.stringify(testData, null, 2),
        "utf8"
      );
      expect(fs.rename).toHaveBeenCalled();
    });

    it("should validate data before writing if validator is provided", async () => {
      // Mock operations
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fs.rename as jest.Mock).mockResolvedValue(undefined);

      const validator = jest.fn().mockReturnValue(true);
      const testData = { test: "valid" };

      const result = await fileSystemService.writeData(
        "test",
        testData,
        validator
      );

      expect(result.success).toBe(true);
      expect(validator).toHaveBeenCalled();
    });

    it("should fail if validation fails", async () => {
      const validator = jest.fn().mockReturnValue(false);
      const invalidData = { test: "invalid" };

      const result = await fileSystemService.writeData(
        "test",
        invalidData,
        validator
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Validation failed");
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it("should handle write errors", async () => {
      // Make sure lock is successfully acquired first
      (fs.writeFile as jest.Mock).mockImplementation(
        (path, content, options) => {
          if (path.toString().endsWith(".lock")) {
            return Promise.resolve();
          }
          return Promise.reject(new Error("Write failed"));
        }
      );

      const result = await fileSystemService.writeData("test", {
        test: "data",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Failed to write");
      expect(logger.error).toHaveBeenCalled();
    });

    it("should fail if lock cannot be acquired", async () => {
      // Mock lock file already exists
      (fs.writeFile as jest.Mock).mockImplementation(
        (path, content, options) => {
          if (path.toString().includes(".lock")) {
            const error: NodeJS.ErrnoException = new Error("File exists");
            error.code = "EEXIST";
            return Promise.reject(error);
          }
          return Promise.resolve();
        }
      );

      const result = await fileSystemService.writeData("test", {
        test: "data",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Could not acquire lock");
    });
  });

  describe("backup and restore", () => {
    it("should create a backup successfully", async () => {
      // Mock file exists
      (fs.access as jest.Mock).mockResolvedValue(undefined);
      (fs.copyFile as jest.Mock).mockResolvedValue(undefined);

      const result = await fileSystemService.createBackup("test");

      expect(result.success).toBe(true);
      expect(fs.copyFile).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalled();
    });

    it("should handle nothing to backup", async () => {
      // Mock file doesn't exist
      (fs.access as jest.Mock).mockRejectedValue(new Error("File not found"));

      const result = await fileSystemService.createBackup("test");

      expect(result.success).toBe(true);
      expect(result.value).toBe("No file to backup");
      expect(fs.copyFile).not.toHaveBeenCalled();
    });

    it("should restore from latest backup", async () => {
      // Mock reading directory and finding backups
      (fs.readdir as jest.Mock).mockResolvedValue([
        "test_2023-01-02T12-00-00-000Z.bak",
        "test_2023-01-01T12-00-00-000Z.bak",
      ]);
      (fs.copyFile as jest.Mock).mockResolvedValue(undefined);

      const result = await fileSystemService.restoreFromLatestBackup("test");

      expect(result.success).toBe(true);
      expect(fs.copyFile).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalled();
    });

    it("should handle no backups available", async () => {
      // Mock empty backups directory
      (fs.readdir as jest.Mock).mockResolvedValue([]);

      const result = await fileSystemService.restoreFromLatestBackup("test");

      expect(result.success).toBe(false);
      expect(result.error).toContain("No backups found");
    });

    it("should list all backups for a file", async () => {
      // Mock directory listing
      const mockBackups = [
        "test_2023-01-01.bak",
        "test_2023-01-02.bak",
        "another_2023-01-01.bak", // This shouldn't be returned
      ];
      (fs.readdir as jest.Mock).mockResolvedValue(mockBackups);

      const result = await fileSystemService.listBackups("test");

      expect(result.success).toBe(true);
      expect(result.value).toEqual([
        "test_2023-01-01.bak",
        "test_2023-01-02.bak",
      ]);
    });

    it("should clean up old backups", async () => {
      // Mock listing many backups
      const mockBackups = [
        "test_2023-01-05.bak", // Newest
        "test_2023-01-04.bak",
        "test_2023-01-03.bak",
        "test_2023-01-02.bak",
        "test_2023-01-01.bak", // Oldest
      ];
      (fs.readdir as jest.Mock).mockResolvedValue(mockBackups);
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      const result = await fileSystemService.cleanupOldBackups("test", 3);

      expect(result.success).toBe(true);
      expect(result.value).toBe(2); // 2 deleted
      expect(fs.unlink).toHaveBeenCalledTimes(2);
    });
  });

  describe("fileExists", () => {
    it("should return true when file exists", async () => {
      (fs.access as jest.Mock).mockResolvedValue(undefined);

      const result = await fileSystemService.fileExists("test");

      expect(result).toEqual({ success: true, value: true });
    });

    it("should return false when file doesn't exist", async () => {
      (fs.access as jest.Mock).mockRejectedValue(new Error("ENOENT"));

      const result = await fileSystemService.fileExists("test");

      expect(result).toEqual({ success: true, value: false });
    });
  });

  describe("listDataFiles", () => {
    it("should return a list of data files", async () => {
      const mockFiles = ["test1.json", "test2.json", "notjson.txt"];
      (fs.readdir as jest.Mock).mockResolvedValue(mockFiles);

      // Mock path.basename to strip extensions
      (path.basename as jest.Mock).mockImplementation((filePath, ext) => {
        if (ext && filePath.endsWith(ext)) {
          return filePath.slice(0, -ext.length);
        }
        return filePath;
      });

      const result = await fileSystemService.listDataFiles();

      expect(result.success).toBe(true);
      expect(result.value).toEqual(["test1", "test2"]);
    });

    it("should handle read errors", async () => {
      (fs.readdir as jest.Mock).mockRejectedValue(new Error("Read failed"));

      const result = await fileSystemService.listDataFiles();

      expect(result.success).toBe(false);
      expect(result.error).toContain("Failed to list data files");
    });
  });
});
