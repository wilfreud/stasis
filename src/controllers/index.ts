import { HandlebarsService } from "src/services/handlebars.service.js";
import BrowserManagerService from "src/services/playwright.service.js";
import type { Request, Response } from "express";
import {
  GeneratePdfFromRawHtmlQueryParam,
  GeneratePdfQueryParam,
} from "src/types/index.js";
import { resolve } from "path";
import { readFileSync, existsSync } from "fs";
import { mockInvoiceData } from "src/mockdata.js";

const browserManagerService = new BrowserManagerService();
const handlebarsService = new HandlebarsService();

export const healthCheck = (_: Request, res: Response) => {
  res.json({
    message: "Playwright based PDF generator",
    timestamp: new Date().toISOString(),
  });
};

export const testPdfGeneration = async (_req: Request, res: Response) => {
  try {
    const template = handlebarsService.compileTemplate(
      readFileSync(
        resolve(".", "src", "templates/thermal-receipt.hbs"),
        "utf-8",
      ),
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

    res.setHeader("Content-Type", "application/pdf");
    const pdfBuffer = await browserManagerService.renderPage(
      template,
      pdfOptions,
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="receipt-${Date.now()}.pdf"`,
    );
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("Error generating receipt:", error);
    res.status(500).json({ error: "Failed to generate receipt PDF" });
  }
};

export const generatePdf = async (
  req: Request<any, any, GeneratePdfQueryParam>,
  res: Response,
) => {
  const { data, pdfOptions, templateId, customTemplate, outputFileName } =
    req.body;

  // Basic data validation
  if (!data) {
    res.status(400).json({ error: "Data is required to generate PDF" });
    return;
  }

  if (typeof data !== "object") {
    res.status(400).json({ error: "Data must be an object" });
    return;
  }

  if (!templateId) {
    res.status(400).json({ error: "Template ID is required" });
    return;
  }

  let templateContent: string;

  // Either use custom template or load from file
  if (customTemplate) {
    templateContent = customTemplate;
  } else {
    const templatePath = resolve(".", "src", "templates", `${templateId}.hbs`);

    // Check if the template file exists
    if (!existsSync(templatePath)) {
      res.status(404).json({ error: "Template not found" });
      return;
    }

    templateContent = readFileSync(templatePath, "utf-8");
  }

  try {
    const template = handlebarsService.compileTemplate(templateContent, data);

    res.setHeader("Content-Type", "application/pdf");
    const pdfBuffer = await browserManagerService.renderPage(
      template,
      pdfOptions,
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${outputFileName || `receipt-${Date.now()}.pdf`}"`,
    );
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("Error generating receipt:", error);
    res
      .status(500)
      .json({ message: "Failed to generate receipt PDF", error: error });
  }
};

export const generatePdfFromRawHtml = async (
  req: Request<any, any, GeneratePdfFromRawHtmlQueryParam>,
  res: Response,
) => {
  const { rawHtml, data, outputFileName, pdfOptions } = req.body;

  // basic data validation
  if (!rawHtml || typeof rawHtml !== "string") {
    res.status(400).json({ error: "Raw HTML is required to generate PDF" });
    return;
  }

  if (!data || typeof data !== "object") {
    res.status(400).json({ error: "Data must be an object" });
    return;
  }

  try {
    const template = handlebarsService.compileTemplate(rawHtml, data);

    res.setHeader("Content-Type", "application/pdf");
    const pdfBuffer = await browserManagerService.renderPage(
      template,
      pdfOptions,
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${outputFileName || `receipt-${Date.now()}.pdf`}"`,
    );
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("Error generating receipt:", error);
    res.status(500).json({ error: "Failed to generate receipt PDF" });
  }
};
