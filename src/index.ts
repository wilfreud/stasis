import express from "express";
import path from "path";
import BrowserManagerService from "./services/playwright.service.js";
import benchmarkMiddleware from "./middlewares/benchmark.middleware.js";
import { upload } from "./middlewares/multer.middleware.js";
import {
  generatePdf,
  generatePdfFromRawHtml,
  healthCheck,
  testPdfGeneration,
} from "./controllers/index.js";
import {
  listTemplates,
  uploadTemplate,
  deleteTemplate,
} from "./controllers/template.controller.js";

// Create a new express application instance
const app = express();

// Middlewares
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.static(path.resolve(".", "public"))); // Serve static files from public directory
app.use(benchmarkMiddleware);

// Set the network port
const port = 7070;

// API Routes following REST standards
app.get("/api/health", healthCheck); // Health check endpoint

// PDF document resources
app.post("/api/documents", generatePdf); // Create PDF from template
app.post("/api/documents/raw", generatePdfFromRawHtml); // Create PDF from raw HTML

// Test endpoint (for development only)
app.get("/api/documents/test", testPdfGeneration); // Should ideally be a POST in production

// Template management endpoints
app.get("/api/templates/list", listTemplates);
app.post(
  "/api/templates/upload",
  upload.single("templateFile"),
  uploadTemplate,
);
app.delete("/api/templates/delete", deleteTemplate);

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});
