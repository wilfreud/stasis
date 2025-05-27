import { Request } from "express";
import type { Page } from "playwright";

export type PDFOptions = Parameters<Page["pdf"]>[0];

/**
 * Base document request parameter interface
 */
interface BaseDocumentRequest {
  /** Template data to be rendered */
  data: Record<string, any>;
  /** PDF generation options passed to Playwright */
  pdfOptions?: PDFOptions;
  /** Custom output filename for the PDF document */
  outputFileName?: string;
}

/**
 * Request body for PDF generation from template
 */
export interface GeneratePdfQueryParam extends BaseDocumentRequest {
  /** ID of the template to use (required if customTemplate not provided) */
  templateId?: string;
  /** Custom template content (required if templateId not provided) */
  customTemplate?: string;
}

/**
 * Request body for PDF generation from raw HTML
 */
export interface GeneratePdfFromRawHtmlQueryParam extends BaseDocumentRequest {
  /** Raw HTML content to render as PDF */
  rawHtml: string;
}

/**
 * Standard API error response format
 */
export interface ApiErrorResponse {
  /** Error status indicator */
  status: "error";
  /** Human-readable error message */
  message: string;
  /** Optional detailed error information */
  error?: string;
  /** Optional resource identifier for 404 errors */
  resourceId?: string;
}

/**
 * Extended Request interface for template upload
 */
export interface TemplateUploadRequest extends Request {
  file?: Express.Multer.File;
  body: {
    templateName: string;
    overwrite: string;
    pageToken: string;
  };
}

/**
 * Extended Request interface for template deletion
 */
export interface TemplateDeleteRequest extends Request {
  body: {
    templateName: string;
    pageToken: string;
  };
}
