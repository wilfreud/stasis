import express, { Request, Response } from "express";
import BrowserManagerService from "./services/playwright.service.js";
import { HandlebarsService } from "./services/handlebars.service.js";
import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";
import { mockInvoiceData } from "./mockdata.js";
import benchmarkMiddleware from "./middlewares/benchmark.middleware.js";

// Create a new express application instance
const app = express();

// Middlewares
app.use(express.json()); // Parse JSON bodies
app.use(benchmarkMiddleware);
// Set the network port
const port = 7070;

const browserManagerService = new BrowserManagerService();
const handlebarsService = new HandlebarsService();

// Define the root path with a greeting message
app.get("/", (_: Request, res: Response) => {
  res.json({
    message: "Playwright based PDF generator",
    timestamp: new Date().toISOString(),
  });
});

app.get("/generate-pdf", async (req: Request, res: Response) => {
  try {
    const template = handlebarsService.compileTemplate(
      await readFile(resolve(".", "src", "templates/receipt.hbs"), "utf-8"),
      mockInvoiceData,
    );

    await writeFile(
      "out.pdf",
      await browserManagerService.renderPage(template),
      "binary",
    );

    res.status(200).json({
      message: "PDF generated successfully",
      timestamp: new Date().toISOString(),
      templateType: "receipt.hbs",
      template,
      data: mockInvoiceData,
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

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
