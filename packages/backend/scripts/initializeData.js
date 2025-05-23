#!/usr/bin/env node

/**
 * Script to initialize data files from templates
 * This creates the data directory structure and populates it with sample data
 */

const fs = require("fs/promises");
const fsSync = require("fs");
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

// Get the base directory from environment or use default
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const TEMPLATES_DIR = path.join(process.cwd(), "data", "templates");
const BACKUP_DIR = path.join(DATA_DIR, "backups");
const BACKUP_FULL_DIR = path.join(BACKUP_DIR, "full");

async function ensureDirectories() {
  console.log(
    `${colors.cyan}${colors.bold}Ensuring directories exist...${colors.reset}`
  );

  // Create main data directory
  if (!fsSync.existsSync(DATA_DIR)) {
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log(
      `${colors.green}Created data directory: ${DATA_DIR}${colors.reset}`
    );
  } else {
    console.log(
      `${colors.yellow}Data directory already exists: ${DATA_DIR}${colors.reset}`
    );
  }

  // Create templates directory
  if (!fsSync.existsSync(TEMPLATES_DIR)) {
    await fs.mkdir(TEMPLATES_DIR, { recursive: true });
    console.log(
      `${colors.green}Created templates directory: ${TEMPLATES_DIR}${colors.reset}`
    );
  } else {
    console.log(
      `${colors.yellow}Templates directory already exists: ${TEMPLATES_DIR}${colors.reset}`
    );
  }

  // Create backup directories
  if (!fsSync.existsSync(BACKUP_DIR)) {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    console.log(
      `${colors.green}Created backups directory: ${BACKUP_DIR}${colors.reset}`
    );
  }

  if (!fsSync.existsSync(BACKUP_FULL_DIR)) {
    await fs.mkdir(BACKUP_FULL_DIR, { recursive: true });
    console.log(
      `${colors.green}Created full backups directory: ${BACKUP_FULL_DIR}${colors.reset}`
    );
  }
}

async function copyTemplateToData(templateName) {
  const templatePath = path.join(TEMPLATES_DIR, `${templateName}.json`);
  const dataPath = path.join(DATA_DIR, `${templateName}.json`);

  try {
    // Check if template exists
    await fs.access(templatePath);

    // Check if data file already exists
    try {
      await fs.access(dataPath);
      console.log(
        `${colors.yellow}Data file already exists: ${dataPath}${colors.reset}`
      );
      return false;
    } catch {
      // Data file doesn't exist, copy template
      await fs.copyFile(templatePath, dataPath);
      console.log(
        `${colors.green}Created data file from template: ${dataPath}${colors.reset}`
      );
      return true;
    }
  } catch (error) {
    console.log(
      `${colors.yellow}Template not found: ${templatePath}${colors.reset}`
    );
    return false;
  }
}

async function initializeData() {
  console.log(
    `${colors.cyan}${colors.bold}=== Data Initialization ===${colors.reset}`
  );

  try {
    // Ensure all required directories exist
    await ensureDirectories();

    // Get list of available templates
    let templates;
    try {
      templates = await fs.readdir(TEMPLATES_DIR);
      templates = templates
        .filter((file) => file.endsWith(".json"))
        .map((file) => path.basename(file, ".json"));
    } catch {
      templates = [];
      console.log(
        `${colors.yellow}No templates found in ${TEMPLATES_DIR}${colors.reset}`
      );
    }

    // Copy each template to data directory
    if (templates.length > 0) {
      console.log(
        `${colors.cyan}${colors.bold}Initializing data files from templates...${colors.reset}`
      );

      let createdCount = 0;
      for (const template of templates) {
        const created = await copyTemplateToData(template);
        if (created) createdCount++;
      }

      console.log(
        `\n${colors.green}${colors.bold}✓ Data initialization completed!${colors.reset}`
      );
      console.log(
        `${colors.green}Created ${createdCount} data files from templates.${colors.reset}`
      );
    } else {
      console.log(
        `${colors.yellow}${colors.bold}No templates to initialize from.${colors.reset}`
      );
      console.log(
        `${colors.yellow}Place template JSON files in the ${TEMPLATES_DIR} directory.${colors.reset}`
      );
    }
  } catch (error) {
    console.error(
      `${colors.red}${colors.bold}Error initializing data:${colors.reset}`,
      error
    );
    process.exit(1);
  }
}

// Run the initialization
initializeData();
