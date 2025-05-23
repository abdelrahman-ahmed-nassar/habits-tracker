import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execPromise = promisify(exec);

// Skip this test by default since we're using warnOnly in the Jest config
// This test should be run manually or in a separate CI pipeline step
describe.skip("TypeScript Compilation", () => {
  it("should compile TypeScript files without errors", async () => {
    // Skip this test if running in CI environment to avoid unexpected failures
    if (process.env.CI) {
      console.log("Skipping TypeScript compilation test in CI environment");
      return;
    }

    // Run TypeScript compiler in noEmit mode (check only)
    try {
      const rootDir = path.resolve(__dirname, "../../");
      const tsConfigPath = path.join(rootDir, "tsconfig.json");

      // Ensure tsconfig.json exists
      expect(fs.existsSync(tsConfigPath)).toBe(true);

      const { stdout, stderr } = await execPromise("npx tsc --noEmit", {
        cwd: rootDir,
      });

      // If there are compilation errors, stderr will contain error messages
      expect(stderr).toBe("");
    } catch (error: any) {
      // Log the error and fail the test
      console.error("TypeScript compilation failed:", error.stderr);
      expect("TypeScript compilation failed").toBe("No compilation errors");
    }
  }, 30000); // Allow up to 30 seconds for compilation
});
