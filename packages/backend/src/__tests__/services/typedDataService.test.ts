import { TypedDataService } from "../../services/typedDataService";
import { FileSystemService } from "../../services/fileSystemService";
import { AppError } from "../../middlewares/errorMiddleware";

// Mock FileSystemService
jest.mock("../../services/fileSystemService");

// Test data interfaces
interface ITestEntity {
  id: string;
  name: string;
  value: number;
}

describe("TypedDataService", () => {
  let dataService: TypedDataService<ITestEntity>;
  let mockFileSystemService: jest.Mocked<FileSystemService>;

  const mockData: ITestEntity[] = [
    { id: "1", name: "Test 1", value: 10 },
    { id: "2", name: "Test 2", value: 20 },
    { id: "3", name: "Test 3", value: 30 },
  ];

  // Type validator for test data
  const mockValidator = (data: unknown): boolean => {
    if (!Array.isArray(data)) return false;

    return data.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        "name" in item &&
        "value" in item
    );
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup mock FileSystemService
    mockFileSystemService =
      new FileSystemService() as jest.Mocked<FileSystemService>;

    // Setup base success responses for the FileSystemService methods
    mockFileSystemService.readData = jest
      .fn()
      .mockResolvedValue({ success: true, value: [...mockData] });
    mockFileSystemService.writeData = jest
      .fn()
      .mockResolvedValue({ success: true, value: [...mockData] });
    mockFileSystemService.createBackup = jest
      .fn()
      .mockResolvedValue({ success: true, value: "backup-path" });
    mockFileSystemService.fileExists = jest
      .fn()
      .mockResolvedValue({ success: true, value: true });
    mockFileSystemService.restoreFromLatestBackup = jest
      .fn()
      .mockResolvedValue({ success: true, value: "restored-path" });
    mockFileSystemService.listBackups = jest
      .fn()
      .mockResolvedValue({ success: true, value: ["backup1", "backup2"] });
    mockFileSystemService.cleanupOldBackups = jest
      .fn()
      .mockResolvedValue({ success: true, value: 2 });

    // Create service instance with mocks
    dataService = new TypedDataService<ITestEntity>(
      "test-entity",
      mockValidator,
      mockFileSystemService
    );
  });

  describe("init", () => {
    it("should initialize an empty file if it doesn't exist", async () => {
      // Mock file doesn't exist
      mockFileSystemService.fileExists = jest
        .fn()
        .mockResolvedValue({ success: true, value: false });

      await dataService.init();

      expect(mockFileSystemService.writeData).toHaveBeenCalledWith("test-entity", []);
    });

    it("should not create a file if it already exists", async () => {
      await dataService.init();

      expect(mockFileSystemService.writeData).not.toHaveBeenCalled();
    });

    it("should throw an error if initializing fails", async () => {
      // Mock file doesn't exist and write fails
      mockFileSystemService.fileExists = jest
        .fn()
        .mockResolvedValue({ success: true, value: false });
      mockFileSystemService.writeData = jest
        .fn()
        .mockResolvedValue({ success: false, error: "Write failed" });

      await expect(dataService.init()).rejects.toThrow(AppError);
    });
  });

  describe("getAll", () => {
    it("should return all entities", async () => {
      const result = await dataService.getAll();

      expect(result).toEqual(mockData);
      expect(mockFileSystemService.readData).toHaveBeenCalledWith("test-entity");
    });

    it("should throw an error if read fails", async () => {
      mockFileSystemService.readData = jest
        .fn()
        .mockResolvedValue({ success: false, error: "Read error" });

      await expect(dataService.getAll()).rejects.toThrow(AppError);
    });
  });

  describe("getById", () => {
    it("should return entity by ID", async () => {
      const result = await dataService.getById("2");

      expect(result).toEqual(mockData[1]);
    });

    it("should throw an error if entity is not found", async () => {
      await expect(dataService.getById("99")).rejects.toThrow(AppError);
      await expect(dataService.getById("99")).rejects.toThrow(/not found/);
    });
  });

  describe("query", () => {
    it("should return entities matching the filter", async () => {
      const result = await dataService.query((item) => item.value > 15);

      expect(result).toEqual([mockData[1], mockData[2]]);
    });

    it("should return empty array if no matches", async () => {
      const result = await dataService.query((item) => item.value > 100);

      expect(result).toEqual([]);
    });
  });

  describe("create", () => {
    it("should create a new entity", async () => {
      const newEntity: ITestEntity = { id: "4", name: "Test 4", value: 40 };

      // Mock so writeData will return the updated array
      mockFileSystemService.writeData = jest
        .fn()
        .mockImplementation((name, data) => {
          return Promise.resolve({
            success: true,
            value: data as ITestEntity[],
          });
        });

      const result = await dataService.create(newEntity);

      expect(result).toEqual(newEntity);
      expect(mockFileSystemService.writeData).toHaveBeenCalled();

      // Check that the entity was added to the mocked data
      const writeCall = mockFileSystemService.writeData.mock
        .calls[0][1] as ITestEntity[];
      expect(writeCall).toHaveLength(mockData.length + 1);
      expect(writeCall).toContainEqual(newEntity);
    });

    it("should throw an error if entity with ID already exists", async () => {
      const existingEntity: ITestEntity = { ...mockData[0] };

      await expect(dataService.create(existingEntity)).rejects.toThrow(
        AppError
      );
      await expect(dataService.create(existingEntity)).rejects.toThrow(
        /already exists/
      );
    });

    it("should throw an error if write fails", async () => {
      const newEntity: ITestEntity = { id: "4", name: "Test 4", value: 40 };

      mockFileSystemService.writeData = jest.fn().mockResolvedValue({
        success: false,
        error: "Write failed",
      });

      await expect(dataService.create(newEntity)).rejects.toThrow(AppError);
    });

    it("should use the validator when writing", async () => {
      const newEntity: ITestEntity = { id: "4", name: "Test 4", value: 40 };

      await dataService.create(newEntity);

      // Check validator function was passed to writeData
      expect(mockFileSystemService.writeData.mock.calls[0][2]).toBeDefined();
    });
  });

  describe("update", () => {
    it("should update an existing entity", async () => {
      const updatedData = { name: "Updated Test 2" };
      const expectedEntity = { ...mockData[1], ...updatedData };

      // Mock so writeData will return the updated array
      mockFileSystemService.writeData = jest
        .fn()
        .mockImplementation((name, data) => {
          return Promise.resolve({
            success: true,
            value: data as ITestEntity[],
          });
        });

      const result = await dataService.update("2", updatedData);

      expect(result).toEqual(expectedEntity);

      // Check that the entity was updated in the data passed to writeData
      const writeCall = mockFileSystemService.writeData.mock
        .calls[0][1] as ITestEntity[];
      const updatedEntity = writeCall.find((item) => item.id === "2");
      expect(updatedEntity).toEqual(expectedEntity);
    });

    it("should throw an error if entity is not found", async () => {
      await expect(
        dataService.update("99", { name: "Not Found" })
      ).rejects.toThrow(AppError);
      await expect(
        dataService.update("99", { name: "Not Found" })
      ).rejects.toThrow(/not found/);
    });

    it("should throw an error if write fails", async () => {
      mockFileSystemService.writeData = jest.fn().mockResolvedValue({
        success: false,
        error: "Write failed",
      });

      await expect(
        dataService.update("2", { name: "Will Fail" })
      ).rejects.toThrow(AppError);
    });
  });

  describe("delete", () => {
    it("should delete an entity", async () => {
      // Mock so writeData captures the data being written
      mockFileSystemService.writeData = jest
        .fn()
        .mockImplementation((name, data) => {
          return Promise.resolve({
            success: true,
            value: data as ITestEntity[],
          });
        });

      await dataService.delete("2");

      // Check that the entity was removed from the data passed to writeData
      const writeCall = mockFileSystemService.writeData.mock
        .calls[0][1] as ITestEntity[];
      expect(writeCall).toHaveLength(mockData.length - 1);
      expect(writeCall.find((item) => item.id === "2")).toBeUndefined();
    });

    it("should throw an error if entity is not found", async () => {
      await expect(dataService.delete("99")).rejects.toThrow(AppError);
      await expect(dataService.delete("99")).rejects.toThrow(/not found/);
    });

    it("should throw an error if write fails", async () => {
      mockFileSystemService.writeData = jest.fn().mockResolvedValue({
        success: false,
        error: "Write failed",
      });

      await expect(dataService.delete("2")).rejects.toThrow(AppError);
    });
  });

  describe("backup operations", () => {
    it("should create a backup", async () => {
      const result = await dataService.backup();

      expect(result).toBe("backup-path");
      const createBackupMock = mockFileSystemService.createBackup;
      expect(createBackupMock).toHaveBeenCalledWith("test-entity");
    });

    it("should restore from backup", async () => {
      const result = await dataService.restore();

      expect(result).toBe("restored-path");
      const restoreMock = mockFileSystemService.restoreFromLatestBackup;
      expect(restoreMock).toHaveBeenCalledWith("test-entity");
    });

    it("should list backups", async () => {
      const result = await dataService.listBackups();

      expect(result).toEqual(["backup1", "backup2"]);
      const listBackupsMock = mockFileSystemService.listBackups;
      expect(listBackupsMock).toHaveBeenCalledWith("test-entity");
    });

    it("should clean up old backups", async () => {
      const result = await dataService.cleanupOldBackups(3);

      expect(result).toBe(2);
      const cleanupMock = mockFileSystemService.cleanupOldBackups;
      expect(cleanupMock).toHaveBeenCalledWith("test-entity", 3);
    });

    it("should throw errors if backup operations fail", async () => {
      mockFileSystemService.createBackup = jest.fn().mockResolvedValue({
        success: false,
        error: "Backup failed",
      });

      mockFileSystemService.restoreFromLatestBackup = jest
        .fn()
        .mockResolvedValue({
          success: false,
          error: "Restore failed",
        });

      mockFileSystemService.listBackups = jest.fn().mockResolvedValue({
        success: false,
        error: "List failed",
      });

      mockFileSystemService.cleanupOldBackups = jest.fn().mockResolvedValue({
        success: false,
        error: "Cleanup failed",
      });

      await expect(dataService.backup()).rejects.toThrow(AppError);
      await expect(dataService.restore()).rejects.toThrow(AppError);
      await expect(dataService.listBackups()).rejects.toThrow(AppError);
      await expect(dataService.cleanupOldBackups()).rejects.toThrow(AppError);
    });
  });
});
