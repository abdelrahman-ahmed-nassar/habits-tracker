#!/usr/bin/env node

/**
 * Script to run TypeScript type checking and show detailed error information
 * This script runs the TypeScript compiler in noEmit mode with strict flags
 * to display file paths and line numbers for TypeScript errors
 */

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// ANSI color codes for prettier output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

// Banner displayed at the start
console.log(
  `${colors.cyan}${colors.bold}=== TypeScript Error Finder ===${colors.reset}`
);
console.log(
  `${colors.cyan}Running strict type check on your TypeScript code...${colors.reset}\n`
);

try {
  // Run TypeScript compiler with strict flags to catch more errors including implicit any
  const output = execSync("npx tsc --noEmit --strict --noImplicitAny", {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  }).toString();

  console.log(
    `${colors.green}${colors.bold}✓ No TypeScript errors found!${colors.reset}`
  );
  process.exit(0);
} catch (error) {
  // Process the error output to extract and format error information
  const errorOutput = error.stdout.toString();

  // Split the error output by lines
  const lines = errorOutput.split("\n");

  // Count errors and warnings
  const errorCount = (errorOutput.match(/error TS\d+:/g) || []).length;
  const warningCount = (errorOutput.match(/warning TS\d+:/g) || []).length;

  // Process and format each error
  let formattedErrors = [];
  let currentError = null;

  for (const line of lines) {
    // Check if this is an error/warning line with file info
    const match = line.match(
      /(.+)\((\d+),(\d+)\): (error|warning) TS(\d+): (.+)/
    );

    if (match) {
      const [_, filePath, lineNum, colNum, level, errorCode, message] = match;

      // Get relative path for nicer output
      const relativePath = path.relative(process.cwd(), filePath);

      // Create a new error entry
      currentError = {
        filePath: relativePath,
        line: parseInt(lineNum),
        column: parseInt(colNum),
        level: level,
        code: errorCode,
        message: message,
        details: [],
      };

      formattedErrors.push(currentError);
    } else if (currentError && line.trim() !== "") {
      // Add additional details to the current error
      currentError.details.push(line);
    }
  }

  // Display a summary and each error
  console.log(
    `${colors.red}${colors.bold}Found ${errorCount} error(s) and ${warningCount} warning(s)${colors.reset}\n`
  );

  formattedErrors.forEach((error, index) => {
    const colorPrefix = error.level === "error" ? colors.red : colors.yellow;

    console.log(
      `${colorPrefix}${colors.bold}${error.level.toUpperCase()} ${index + 1}:${
        colors.reset
      } ${error.message}`
    );
    console.log(
      `${colors.cyan}File:${colors.reset} ${error.filePath}:${error.line}:${error.column}`
    );
    console.log(`${colors.cyan}Code:${colors.reset} TS${error.code}\n`);

    if (error.details.length > 0) {
      console.log(`${colors.cyan}Details:${colors.reset}`);
      error.details.forEach((detail) => {
        console.log(`  ${detail}`);
      });
      console.log("");
    }
  });

  console.log(
    `${colors.red}${colors.bold}TypeScript check failed with ${errorCount} error(s) and ${warningCount} warning(s)${colors.reset}`
  );
  console.log(
    `${colors.cyan}Run 'npm run type-check' for standard output or 'npm run lint:fix' to attempt automatic fixes.${colors.reset}`
  );

  process.exit(1);
}
