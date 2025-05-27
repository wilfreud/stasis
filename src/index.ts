import express from "express";
import BrowserManagerService from "./services/playwright.service.js";
import benchmarkMiddleware from "./middlewares/benchmark.middleware.js";
import {
  generatePdf,
  generatePdfFromRawHtml,
  healthCheck,
  testPdfGeneration,
} from "./controllers/index.js";

// Create a new express application instance
const app = express();

// Middlewares
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(benchmarkMiddleware);

// Set the network port
const port = 7070;

const browserManagerService = new BrowserManagerService();

// Define the root path with a greeting message
app.get("/", healthCheck);

app.get("/test", testPdfGeneration);

app.post("/generate-pdf", generatePdf);

app.post("/generate-raw", generatePdfFromRawHtml);

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});

// Handle server shutdown gracefully
process.on("SIGINT", async () => {
  console.log("🌀 Server is shutting down...");
  await browserManagerService.closeBrowser(); // Ensure all browser instances are closed
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("🌀 Server is shutting down...");
  await browserManagerService.closeBrowser(); // Ensure all browser instances are closed
  process.exit(0);
});
