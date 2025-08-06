#!/usr/bin/env node

/**
 * Test script for template checksums endpoint
 * Validates the checksum calculation functionality
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { createHash } from "crypto";

const SERVER_URL = "http://localhost:7070";

/**
 * Calculate SHA-256 checksum for a file
 */
function calculateFileChecksum(filePath) {
  try {
    const content = readFileSync(filePath, "utf-8");
    const hash = createHash("sha256");
    hash.update(content, "utf-8");
    return hash.digest("hex");
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Test the checksums endpoint
 */
async function testChecksumsEndpoint() {
  try {
    console.log("🧪 Testing Template Checksums Endpoint");
    console.log("=====================================\n");

    // Fetch checksums from API
    console.log("📡 Fetching checksums from API...");
    const response = await fetch(`${SERVER_URL}/api/templates/checksums`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const apiChecksums = await response.json();
    console.log("✅ API Response received");
    console.log(`📊 Found ${Object.keys(apiChecksums).length} templates\n`);

    // Test a few templates against local calculation
    const templatesDir = resolve(".", "templates");
    const testTemplates = ["invoice", "resume", "thermal-receipt"];

    console.log("🔍 Validating checksums against local files...\n");

    let validationsPassed = 0;
    let validationsFailed = 0;

    for (const templateName of testTemplates) {
      const templatePath = resolve(templatesDir, `${templateName}.hbs`);

      if (existsSync(templatePath)) {
        const localChecksum = calculateFileChecksum(templatePath);
        const apiChecksum = apiChecksums[templateName];

        if (localChecksum === apiChecksum) {
          console.log(`✅ ${templateName}: Checksums match`);
          console.log(`   ${localChecksum}`);
          validationsPassed++;
        } else {
          console.log(`❌ ${templateName}: Checksums DO NOT match`);
          console.log(`   Local:  ${localChecksum}`);
          console.log(`   API:    ${apiChecksum}`);
          validationsFailed++;
        }
      } else {
        console.log(`⚠️  ${templateName}: Template file not found locally`);
      }
      console.log("");
    }

    // Display all API checksums
    console.log("📋 All Template Checksums from API:");
    console.log("===================================");
    for (const [templateName, checksum] of Object.entries(apiChecksums)) {
      console.log(`${templateName.padEnd(30)} : ${checksum}`);
    }

    // Summary
    console.log("\n📊 Validation Summary:");
    console.log(`✅ Passed: ${validationsPassed}`);
    console.log(`❌ Failed: ${validationsFailed}`);

    if (validationsFailed === 0) {
      console.log("\n🎉 All checksum validations passed!");
    } else {
      console.log(
        "\n⚠️  Some validations failed. Please check the implementation.",
      );
    }

    // Performance test
    console.log("\n⏱️  Performance Test:");
    const startTime = Date.now();
    const perfResponse = await fetch(`${SERVER_URL}/api/templates/checksums`);
    await perfResponse.json();
    const endTime = Date.now();
    console.log(`   Response time: ${endTime - startTime}ms`);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

/**
 * Test endpoint error handling
 */
async function testErrorHandling() {
  console.log("\n🚨 Testing Error Handling:");

  try {
    // Test with non-existent endpoint
    const response = await fetch(
      `${SERVER_URL}/api/templates/checksums-invalid`,
    );
    console.log(
      `   Invalid endpoint: ${response.status} ${response.statusText} ✅`,
    );
  } catch (error) {
    console.log(`   Invalid endpoint test failed: ${error.message}`);
  }
}

// Run tests
console.log("🚀 Starting Template Checksums Tests...\n");
testChecksumsEndpoint()
  .then(() => testErrorHandling())
  .then(() => {
    console.log("\n✨ All tests completed!");
  })
  .catch((error) => {
    console.error("💥 Test suite failed:", error);
    process.exit(1);
  });
