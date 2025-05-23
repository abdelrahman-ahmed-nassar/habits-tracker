#!/usr/bin/env node

/**
 * Comprehensive checking script that runs both TypeScript and ESLint
 * to provide a unified view of all errors in the codebase
 */

const { execSync } = require("child_process");
const path = require("path");

// ANSI color codes for prettier output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

console.log(
  `${colors.cyan}${colors.bold}=== Comprehensive Code Quality Check ===${colors.reset}`
);
console.log(
  `${colors.cyan}Running TypeScript and ESLint checks...${colors.reset}\n`
);

let typescriptErrors = false;
let eslintErrors = false;

// Run TypeScript checks
console.log(
  `${colors.cyan}${colors.bold}[1/2] TypeScript Check${colors.reset}`
);
try {
  execSync("npx tsc --noEmit --strict --noImplicitAny", {
    encoding: "utf8",
    stdio: "inherit",
  });
  console.log(
    `${colors.green}${colors.bold}✓ TypeScript check passed!${colors.reset}\n`
  );
} catch (error) {
  typescriptErrors = true;
  console.log(
    `${colors.red}${colors.bold}✗ TypeScript check failed${colors.reset}\n`
  );
}

// Run ESLint checks
console.log(`${colors.cyan}${colors.bold}[2/2] ESLint Check${colors.reset}`);
try {
  execSync("npx eslint . --ext .ts --format stylish", {
    encoding: "utf8",
    stdio: "inherit",
  });
  console.log(
    `${colors.green}${colors.bold}✓ ESLint check passed!${colors.reset}\n`
  );
} catch (error) {
  eslintErrors = true;
  console.log(
    `${colors.red}${colors.bold}✗ ESLint check failed${colors.reset}\n`
  );
}

// Summary
console.log(
  `${colors.cyan}${colors.bold}=== Code Quality Check Summary ===${colors.reset}`
);

if (!typescriptErrors && !eslintErrors) {
  console.log(
    `${colors.green}${colors.bold}✓ All checks passed! Your code looks great.${colors.reset}`
  );
  process.exit(0);
} else {
  let errorTypes = [];
  if (typescriptErrors) errorTypes.push("TypeScript");
  if (eslintErrors) errorTypes.push("ESLint");

  console.log(
    `${colors.red}${colors.bold}✗ Found errors in: ${errorTypes.join(", ")}${
      colors.reset
    }`
  );

  console.log(`\n${colors.cyan}Recommendation:${colors.reset}`);
  if (eslintErrors) {
    console.log(
      `- Run ${colors.bold}npm run lint:fix${colors.reset} to automatically fix some ESLint issues`
    );
  }
  if (typescriptErrors) {
    console.log(`- Check the TypeScript errors above and fix them manually`);
  }

  process.exit(1);
}
