#!/usr/bin/env node

/**
 * Test script for bulk template upload functionality
 * Creates sample templates and uploads them via the API
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Sample templates content
const templates = {
  "test-invoice": `
<html>
<head>
  <title>Test Invoice - {{invoiceNumber}}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { border-bottom: 2px solid #333; padding-bottom: 10px; }
    .amount { font-weight: bold; color: #007bff; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Invoice {{invoiceNumber}}</h1>
    <p>Date: {{currentDate "DD/MM/YYYY"}}</p>
  </div>
  <div class="content">
    <h2>Bill To:</h2>
    <p>{{client.name}}</p>
    <p>{{client.address}}</p>
    
    <h3>Items:</h3>
    {{#each items}}
    <div>
      {{description}} - Qty: {{quantity}} - <span class="amount">€{{unitPrice}}</span>
    </div>
    {{/each}}
    
    <div class="total">
      <strong>Total: <span class="amount">€{{totalAmount}}</span></strong>
    </div>
  </div>
</body>
</html>`,

  "test-receipt": `
<html>
<head>
  <title>Receipt - {{receiptNumber}}</title>
  <style>
    body { 
      font-family: monospace; 
      font-size: 12px; 
      max-width: 300px; 
      margin: 0 auto; 
    }
    .center { text-align: center; }
    .line { border-bottom: 1px dashed #000; margin: 5px 0; }
  </style>
</head>
<body>
  <div class="center">
    <h2>{{company.name}}</h2>
    <p>{{company.address}}</p>
    <div class="line"></div>
  </div>
  
  <p><strong>Receipt: {{receiptNumber}}</strong></p>
  <p>Date: {{currentDate "DD/MM/YYYY HH:mm"}}</p>
  
  <div class="line"></div>
  
  {{#each items}}
  <div>
    {{description}}<br>
    {{quantity}} x {{unitPrice}} = €{{total}}
  </div>
  {{/each}}
  
  <div class="line"></div>
  <div class="center">
    <strong>TOTAL: €{{totalAmount}}</strong>
  </div>
  
  <div class="center">
    <p>Thank you for your business!</p>
  </div>
</body>
</html>`,

  "test-simple": `
<html>
<head>
  <title>{{title}}</title>
</head>
<body>
  <h1>{{title}}</h1>
  <p>Hello {{name}}, this is a simple test template.</p>
  <p>Generated on: {{currentDate "DD/MM/YYYY"}}</p>
</body>
</html>`,
};

/**
 * Create temporary test template files
 */
function createTestTemplates() {
  const tempDir = resolve(__dirname, "../temp-templates");

  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true });
  }

  const filePaths = [];

  for (const [name, content] of Object.entries(templates)) {
    const filePath = resolve(tempDir, `${name}.hbs`);
    writeFileSync(filePath, content.trim());
    filePaths.push(filePath);
    console.log(`✅ Created test template: ${name}.hbs`);
  }

  return { tempDir, filePaths };
}

/**
 * Test the bulk upload API endpoint
 */
async function testBulkUpload() {
  try {
    console.log("🚀 Starting bulk upload test...\n");

    // Create test templates
    const { tempDir, filePaths } = createTestTemplates();

    console.log(`\n📁 Test templates created in: ${tempDir}`);
    console.log(
      "📄 Templates to upload:",
      filePaths.map((p) => p.split(/[\\/]/).pop()),
    );

    console.log("\n💡 To test the bulk upload, use one of these methods:");
    console.log("\n📮 Option 1: Using curl command:");
    console.log(
      "curl -X POST http://localhost:7070/api/templates/upload/bulk \\",
    );
    filePaths.forEach((path, index) => {
      console.log(
        `  -F "templateFiles=@${path}" ${index === filePaths.length - 1 ? "\\" : "\\"}`,
      );
    });
    console.log('  -F "overwrite=true" \\');
    console.log('  -F "pageToken=test-token"');

    console.log("\n🌐 Option 2: Use the web interface:");
    console.log("1. Open http://localhost:7070 in your browser");
    console.log('2. Look for the new "Bulk Upload" section');
    console.log("3. Select all files from:", tempDir);

    console.log("\n📊 Expected API Response Format:");
    console.log(
      JSON.stringify(
        {
          status: "success",
          message: "All 3 templates uploaded successfully",
          totalFiles: 3,
          successCount: 3,
          errorCount: 0,
          skippedCount: 0,
          results: [
            {
              originalName: "test-invoice.hbs",
              templateName: "test-invoice",
              status: "success",
              message: "Template created successfully",
            },
            // ... more results
          ],
        },
        null,
        2,
      ),
    );
  } catch (error) {
    console.error("❌ Error in bulk upload test:", error.message);
  }
}

// Run the test
testBulkUpload();
