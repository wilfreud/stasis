import express from "express";
import type { Request, Response } from "express";
import BrowserManagerService from "./services/playwright.service.js";
import { HandlebarsService } from "./services/handlebars.service.js";
import { readFileSync } from "fs";
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
    availableEndpoints: [
      "/generate-pdf",
      "/generate-receipt",
      "/generate-invoice",
    ],
  });
});

app.get("/generate-receipt", async (req: Request, res: Response) => {
  try {
    const template = handlebarsService.compileTemplate(
      readFileSync(
        resolve(".", "src", "templates/thermal-receipt.hbs"),
        "utf-8",
      ),
      mockInvoiceData,
    );

    const pdfOptions = {
      format: "a7",
      printBackground: true,
      margin: {
        top: "0.1cm",
        right: "0.1cm",
        bottom: "0.1cm",
        left: "0.1cm",
      },
    };

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="receipt.pdf"');
    const pdfBuffer = await browserManagerService.renderPage(
      template,
      pdfOptions,
    );
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("Error generating receipt:", error);
    res.status(500).json({ error: "Failed to generate receipt PDF" });
  }
});

app.get("/generate-pdf", async (req: Request, res: Response) => {
  try {
    const template = handlebarsService.compileTemplate(
      readFileSync(
        resolve(".", "src", "templates/thermal-receipt.hbs"),
        "utf-8",
      ),
      mockInvoiceData,
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="sample.pdf"');
    const pdfBuffer = await browserManagerService.renderPage(template);
    res.status(200).send(pdfBuffer);
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
