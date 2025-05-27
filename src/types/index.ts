import type { Page } from "playwright";

export type PDFOptions = Parameters<Page["pdf"]>[0];

interface BaseQueryParam {
  data: Record<string, any>;
  pdfOptions?: PDFOptions;
  outputFileName?: string;
}

export interface GeneratePdfQueryParam extends BaseQueryParam {
  templateId?: string;
  customTemplate?: string;
}

export interface GeneratePdfFromRawHtmlQueryParam extends BaseQueryParam {
  rawHtml: string;
}
