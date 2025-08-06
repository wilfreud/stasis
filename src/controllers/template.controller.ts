import { Request, Response } from "express";
import { resolve } from "path";
import { readdir, writeFile, unlink, readFile } from "fs/promises";
import { existsSync } from "fs";
import { createHash } from "crypto";
import path from "path";
import {
  TemplateDeleteRequest,
  TemplateUploadRequest,
  BulkTemplateUploadRequest,
  BulkTemplateUploadResponse,
  TemplateUploadResult,
  TemplateChecksumsResponse,
} from "@/types/index.js";

const templatesDir = process.env.TEMPLATES_DIR || path.resolve("templates");

/**
 * Lists all available templates in the templates directory
 *
 * @param _req - Express Request object
 * @param res - Express Response object
 */
export const listTemplates = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const files = await readdir(templatesDir);
    const templates = files
      .filter((file) => file.endsWith(".hbs") || file.endsWith(".handlebars"))
      .map((file) => file.replace(/\.(hbs|handlebars)$/, ""));

    res.json(templates);
  } catch (error) {
    console.error("Error listing templates:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to list templates",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Uploads a new template file to the templates directory
 *
 * @param req - Extended Express Request object with file data
 * @param res - Express Response object
 */
export const uploadTemplate = async (
  req: TemplateUploadRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        status: "error",
        message: "No template file provided",
      });
      return;
    }

    const { templateName, overwrite } = req.body;
    const templatePath = resolve(templatesDir, `${templateName}.hbs`);

    // Check if template exists and overwrite is not enabled
    if (existsSync(templatePath) && overwrite !== "true") {
      res.status(409).json({
        status: "error",
        message: "Template already exists. Enable overwrite to replace it.",
      });
      return;
    }

    // Write the file
    await writeFile(templatePath, req.file.buffer.toString("utf-8"));

    res.status(201).json({
      status: "success",
      message: `Template '${templateName}' has been ${existsSync(templatePath) ? "updated" : "created"}`,
    });
  } catch (error) {
    console.error("Error uploading template:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to upload template",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Deletes a template file from the templates directory
 *
 * @param req - Extended Express Request object with template name
 * @param res - Express Response object
 */
export const deleteTemplate = async (
  req: TemplateDeleteRequest,
  res: Response,
): Promise<void> => {
  try {
    const { templateName } = req.body;
    const templatePath = resolve(templatesDir, `${templateName}.hbs`);

    if (!existsSync(templatePath)) {
      res.status(404).json({
        status: "error",
        message: "Template not found",
      });
      return;
    }

    await unlink(templatePath);

    res.json({
      status: "success",
      message: `Template '${templateName}' has been deleted`,
    });
  } catch (error) {
    console.error("Error deleting template:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete template",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Helper function to extract template name from filename
 * Removes .hbs or .handlebars extension and sanitizes the name
 */
const extractTemplateName = (filename: string): string => {
  return filename
    .replace(/\.(hbs|handlebars)$/i, "")
    .replace(/[^a-zA-Z0-9\-_]/g, "-")
    .toLowerCase();
};

/**
 * Uploads multiple template files to the templates directory
 * Processes each file individually and returns detailed results
 *
 * @param req - Extended Express Request object with multiple file data
 * @param res - Express Response object
 */
export const uploadBulkTemplates = async (
  req: BulkTemplateUploadRequest,
  res: Response,
): Promise<void> => {
  try {
    // Handle different types of files property from multer
    let files: Express.Multer.File[] = [];

    if (Array.isArray(req.files)) {
      files = req.files;
    } else if (req.files && typeof req.files === "object") {
      // If files is an object, flatten all arrays
      files = Object.values(req.files).flat();
    }

    if (files.length === 0) {
      res.status(400).json({
        status: "error",
        message: "No template files provided",
      });
      return;
    }

    const { overwrite } = req.body;
    const enableOverwrite = overwrite === "true";
    const results: TemplateUploadResult[] = [];

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // Process each file individually
    for (const file of files) {
      const templateName = extractTemplateName(file.originalname);
      const templatePath = resolve(templatesDir, `${templateName}.hbs`);
      const fileExists = existsSync(templatePath);

      try {
        // Check if template exists and overwrite is not enabled
        if (fileExists && !enableOverwrite) {
          results.push({
            originalName: file.originalname,
            templateName,
            status: "skipped",
            message: "Template already exists. Enable overwrite to replace it.",
          });
          skippedCount++;
          continue;
        }

        // Validate file content (basic check)
        const content = file.buffer.toString("utf-8");
        if (content.trim().length === 0) {
          results.push({
            originalName: file.originalname,
            templateName,
            status: "error",
            message: "Template file is empty",
            error: "Empty file content",
          });
          errorCount++;
          continue;
        }

        // Write the file
        await writeFile(templatePath, content);

        results.push({
          originalName: file.originalname,
          templateName,
          status: "success",
          message: fileExists
            ? "Template updated successfully"
            : "Template created successfully",
        });
        successCount++;
      } catch (fileError) {
        results.push({
          originalName: file.originalname,
          templateName,
          status: "error",
          message: "Failed to save template",
          error:
            fileError instanceof Error ? fileError.message : String(fileError),
        });
        errorCount++;
      }
    }

    // Determine overall status
    let overallStatus: "success" | "partial" | "error";
    let message: string;

    if (errorCount === 0 && skippedCount === 0) {
      overallStatus = "success";
      message = `All ${successCount} templates uploaded successfully`;
    } else if (successCount > 0) {
      overallStatus = "partial";
      message = `Bulk upload completed: ${successCount} successful, ${errorCount} errors, ${skippedCount} skipped`;
    } else {
      overallStatus = "error";
      message = `Bulk upload failed: ${errorCount} errors, ${skippedCount} skipped`;
    }

    const response: BulkTemplateUploadResponse = {
      status: overallStatus,
      message,
      totalFiles: files.length,
      successCount,
      errorCount,
      skippedCount,
      results,
    };

    // Set appropriate HTTP status code
    const httpStatus =
      overallStatus === "error" ? 500 : overallStatus === "partial" ? 207 : 201;

    res.status(httpStatus).json(response);
  } catch (error) {
    console.error("Error in bulk template upload:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to process bulk template upload",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Downloads a template file from the templates directory
 *
 * @param req - Express Request object with template name parameter
 * @param res - Express Response object
 */
export const downloadTemplate = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { templateName } = req.params;
    const templatePath = resolve(templatesDir, `${templateName}.hbs`);

    if (!existsSync(templatePath)) {
      res.status(404).json({
        status: "error",
        message: "Template not found",
      });
      return;
    }

    const content = await readFile(templatePath, "utf-8");

    // Set proper headers for file download
    res.setHeader("Content-Type", "text/plain");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${templateName}.hbs"`,
    );

    res.send(content);
  } catch (error) {
    console.error("Error downloading template:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to download template",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Calculates SHA-256 checksums for all templates in the templates directory
 * Returns a map of template names to their checksums for integrity verification
 *
 * @param _req - Express Request object
 * @param res - Express Response object
 */
export const getTemplateChecksums = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const files = await readdir(templatesDir);
    const templateFiles = files.filter(
      (file) => file.endsWith(".hbs") || file.endsWith(".handlebars"),
    );

    const checksums: TemplateChecksumsResponse = {};

    // Process each template file
    for (const file of templateFiles) {
      try {
        const filePath = resolve(templatesDir, file);
        const content = await readFile(filePath, "utf-8");

        // Calculate SHA-256 checksum
        const hash = createHash("sha256");
        hash.update(content, "utf-8");
        const checksum = hash.digest("hex");

        // Use template name (without extension) as key
        const templateName = file.replace(/\.(hbs|handlebars)$/, "");
        checksums[templateName] = checksum;
      } catch (fileError) {
        console.warn(`Failed to process template file ${file}:`, fileError);
        // Continue processing other files even if one fails
      }
    }

    res.json(checksums);
  } catch (error) {
    console.error("Error calculating template checksums:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to calculate template checksums",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
