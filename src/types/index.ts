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
  /** Enable wait for external resources full load before rendering (workaround for black pages issue) */
  loadExternalResources?: boolean;
  /** Enable Tailwind CSS support (v4 by default) */
  useTailwindCss?: boolean;
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
export interface GeneratePdfFromRawHtmlQueryParam
  extends Partial<BaseDocumentRequest> {
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

/**
 * Extended Request interface for bulk template upload
 */
export interface BulkTemplateUploadRequest extends Request {
  files?:
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] };
  body: {
    overwrite: string;
    pageToken: string;
  };
}

/**
 * Result of a single template upload operation
 */
export interface TemplateUploadResult {
  /** Original filename of the uploaded template */
  originalName: string;
  /** Template name/ID that was assigned */
  templateName: string;
  /** Upload status */
  status: "success" | "error" | "skipped";
  /** Status message */
  message: string;
  /** Error details if status is "error" */
  error?: string;
}

/**
 * Response for bulk template upload operations
 */
export interface BulkTemplateUploadResponse {
  /** Overall operation status */
  status: "success" | "partial" | "error";
  /** Summary message */
  message: string;
  /** Total number of files processed */
  totalFiles: number;
  /** Number of successful uploads */
  successCount: number;
  /** Number of files with errors */
  errorCount: number;
  /** Number of files skipped (already exist, overwrite disabled) */
  skippedCount: number;
  /** Detailed results for each file */
  results: TemplateUploadResult[];
}

/**
 * Response for template checksums endpoint
 */
export interface TemplateChecksumsResponse {
  /** Map of template names to their SHA-256 checksums */
  [templateName: string]: string;
}

export type TemplateRenderOptions = Partial<
  Parameters<Page["setContent"]>[1]
> & {
  /** Enable Tailwind CSS support (v4 by default) */
  useTailwindCss?: boolean;
  // /** Force Tailwind to v3 */
  // enableTailwindV3?: boolean;
};
