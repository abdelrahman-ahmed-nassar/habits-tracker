// Set up test environment variables
process.env.NODE_ENV = "test";
process.env.PORT = "3001";
process.env.DATA_DIR = "./test-data";

// Increase timeout for tests
jest.setTimeout(10000);
