import fs from "fs";
import path from "path";

const folders = [
  "src/components/forms",
  "src/pages",
  "src/hooks",
  "src/services",
  "src/types",
  "src/utils",
  "src/context",
  "src/styles",
  "src/assets/icons",
];

folders.forEach((folder) => {
  const fullPath = path.resolve(folder);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created folder: ${folder}`);
  } else {
    console.log(`Folder already exists: ${folder}`);
  }
});
