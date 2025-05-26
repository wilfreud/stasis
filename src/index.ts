import express, { Request, Response } from "express";
import BrowserManager from "./playwright.js";

// Create a new express application instance
const app = express();

// Set the network port
const port = 7070;

const browserManager = new BrowserManager();

// Define the root path with a greeting message
app.get("/", (_: Request, res: Response) => {
  res.json({
    message: "Playwright based PDF generator",
    timestamp: new Date().toISOString(),
  });
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});

// Handle server shutdown gracefully
process.on("SIGINT", async () => {
  console.log("🌀 Server is shutting down...");
  await browserManager.closeBrowser(); // Ensure all browser instances are closed
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("🌀 Server is shutting down...");
  await browserManager.closeBrowser(); // Ensure all browser instances are closed
  process.exit(0);
});
