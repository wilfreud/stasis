import { HandlebarsService } from "../services/handlebars.service.js";
import BrowserManagerService from "../services/playwright.service.js";
import type { Request, Response } from "express";
import {
  GeneratePdfFromRawHtmlQueryParam,
  GeneratePdfQueryParam,
  TemplateRenderOptions,
} from "../types/index.js";
import { resolve } from "path";
import { readFileSync, existsSync } from "fs";
import { mockInvoiceData } from "../mockdata.js";

const browserManagerService = new BrowserManagerService();
const handlebarsService = new HandlebarsService();

/**
 * Health check endpoint
 * Returns service health status and information
 */
export const healthCheck = (_: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    service: "Playwright based PDF generator",
    timestamp: new Date().toISOString(),
  });
};

/**
 * Test PDF generation endpoint
 * Generates a sample PDF using test data and default template
 */
export const testPdfGeneration = async (_req: Request, res: Response) => {
  try {
    const templatesDir = process.env.TEMPLATES_DIR || resolve(".", "templates");
    const template = handlebarsService.compileTemplate(
      readFileSync(resolve(templatesDir, "thermal-receipt.hbs"), "utf-8"),
      mockInvoiceData,
    );

    const pdfOptions = {
      format: "a6",
      printBackground: true,
      margin: {
        top: "1cm",
        right: "1cm",
        bottom: "1cm",
        left: "1cm",
      },
    };

    // Set proper headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    const pdfBuffer = await browserManagerService.renderPage(
      template,
      pdfOptions,
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="receipt-${Date.now()}.pdf"`,
    );
    res.status(201).send(pdfBuffer); // 201 Created is proper for resource creation
  } catch (error) {
    console.error("Error generating receipt:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to generate receipt PDF",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const generatePdf = async (
  req: Request<any, any, GeneratePdfQueryParam>,
  res: Response,
) => {
  const {
    data,
    pdfOptions,
    templateId,
    customTemplate,
    outputFileName,
    useTailwindCss = false,
    loadExternalResources = false,
  } = req.body;

  // Basic data validation with proper REST error responses
  if (!data) {
    res.status(400).json({
      status: "error",
      message: "Data is required to generate PDF",
    });
    return;
  }

  if (typeof data !== "object") {
    res.status(400).json({
      status: "error",
      message: "Data must be an object",
    });
    return;
  }

  if (!templateId && !customTemplate) {
    res.status(400).json({
      status: "error",
      message: "Either templateId or customTemplate is required",
    });
    return;
  }

  let templateContent: string;

  // Either use custom template or load from file
  if (customTemplate) {
    templateContent = customTemplate;
  } else if (templateId) {
    const templatesDir = process.env.TEMPLATES_DIR || resolve(".", "templates");
    const templatePath = resolve(templatesDir, `${templateId}.hbs`);

    // Check if the template file exists
    if (!existsSync(templatePath)) {
      res.status(404).json({
        status: "error",
        message: "Template not found",
        resourceId: templateId,
      });
      return;
    }

    templateContent = readFileSync(templatePath, "utf-8");
  } else {
    // This should never happen due to earlier validation
    res.status(400).json({
      status: "error",
      message: "Invalid request parameters",
    });
    return;
  }

  try {
    const template = handlebarsService.compileTemplate(
      templateContent,
      data,
      templateId,
    );

    // Set proper headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    const renderOptions: TemplateRenderOptions = {};

    if (loadExternalResources) {
      renderOptions.waitUntil = "networkidle"; // Wait for all resources to load
    }

    if (useTailwindCss) {
      renderOptions.useTailwindCss = true; // Enable Tailwind CSS support
    }

    const pdfBuffer = await browserManagerService.renderPage(
      template,
      pdfOptions,
      renderOptions,
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${outputFileName || `document-${Date.now()}.pdf`}"`,
    );

    res.status(201).send(pdfBuffer); // 201 Created is proper for resource creation
  } catch (error) {
    console.error("Error generating PDF document:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to generate PDF document",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Generate PDF from raw HTML
 * Creates a PDF document using supplied raw HTML and data
 */
export const generatePdfFromRawHtml = async (
  req: Request<any, any, GeneratePdfFromRawHtmlQueryParam>,
  res: Response,
) => {
  const {
    rawHtml,
    data,
    outputFileName,
    pdfOptions,
    loadExternalResources,
    useTailwindCss,
  } = req.body;

  // Basic data validation with proper REST error responses
  if (!rawHtml || typeof rawHtml !== "string") {
    res.status(400).json({
      status: "error",
      message: "Raw HTML is required to generate PDF",
    });
    return;
  }

  if (data && typeof data !== "object") {
    res.status(400).json({
      status: "error",
      message: "Data must be an object",
    });
    return;
  }

  try {
    // Set proper headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    const renderOptions: TemplateRenderOptions = {};

    if (loadExternalResources) {
      renderOptions.waitUntil = "networkidle"; // Wait for all resources to load
    }

    if (useTailwindCss) {
      renderOptions.useTailwindCss = true; // Enable Tailwind CSS support
    }
    const pdfBuffer = await browserManagerService.renderPage(
      data ? handlebarsService.compileTemplate(rawHtml, data) : rawHtml,
      pdfOptions,
      renderOptions,
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${outputFileName || `document-${Date.now()}.pdf`}"`,
    );
    res.status(201).send(pdfBuffer); // 201 Created is proper for resource creation
  } catch (error) {
    console.error("Error generating PDF document:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to generate PDF document",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Handle server shutdown gracefully
process.on("SIGINT", async () => {
  console.log("🌀 Server is shutting down, closing browser...");
  await browserManagerService.closeBrowser(); // Ensure all browser instances are closed
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("🌀 Server is shutting down, closing browser...");
  await browserManagerService.closeBrowser(); // Ensure all browser instances are closed
  process.exit(0);
});
