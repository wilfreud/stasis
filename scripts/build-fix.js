#!/usr/bin/env node
import fs from "fs";
import path from "path";

// Read the original package.json
const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));

// Add imports configuration for path aliasing
packageJson.imports = {
  "#/*": "./*",
};

// Create the dist directory if it doesn't exist
if (!fs.existsSync("./dist")) {
  fs.mkdirSync("./dist", { recursive: true });
}

// Write a modified package.json to the dist directory
fs.writeFileSync("./dist/package.json", JSON.stringify(packageJson, null, 2));

console.log(
  "✅ Build script completed. Added path aliases to dist/package.json",
);
