import { Request, Response } from "express";
import { resolve } from "path";
import { readdir, writeFile, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { TemplateDeleteRequest, TemplateUploadRequest } from "@/types/index.js";

const templatesDir =
  process.env.TEMPLATES_DIR || path.resolve("src", "templates");

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
