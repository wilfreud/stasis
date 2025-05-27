// import { IsObject, IsOptional, IsString } from "class-validator";
// import { GeneratePdfQueryParam, PDFOptions } from "src/types/index.js";

// export class GeneratePdfQueryParamDto implements GeneratePdfQueryParam {
//   @IsString({ message: "Data must be a valid JSON string" })
//   templateId?: string;

//   @IsString({ message: "Custom template must be a valid string" })
//   customTemplate?: string | undefined;

//   @IsString({ message: "Output file name must be a valid string" })
//   outputFileName?: string | undefined;

//   @IsObject({ message: "Data must be a valid JSON object" })
//   data!: Record<string, any>;

//   @IsObject({ message: "PDF options must be a valid object" })
//   @IsOptional()
//   pdfOptions?: PDFOptions;
// }
