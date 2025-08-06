# Bulk Template Upload - Implementation Guide

## Overview

This document describes the new bulk template upload functionality added to the Stasis PDF generation service.

## New API Endpoint

### `POST /api/templates/upload/bulk`

Uploads multiple Handlebars templates simultaneously.

**Request:**

- Method: `POST`
- Content-Type: `multipart/form-data`
- Maximum files: 20
- Maximum file size: 2MB per file
- Supported extensions: `.hbs`, `.handlebars`

**Form Data:**

- `templateFiles`: Multiple files (use `templateFiles[]` for arrays)
- `overwrite`: `"true"` or `"false"` - whether to overwrite existing templates
- `pageToken`: CSRF protection token

**Response Format:**

```json
{
  "status": "success" | "partial" | "error",
  "message": "Summary message",
  "totalFiles": 3,
  "successCount": 2,
  "errorCount": 1,
  "skippedCount": 0,
  "results": [
    {
      "originalName": "invoice.hbs",
      "templateName": "invoice",
      "status": "success",
      "message": "Template created successfully"
    },
    {
      "originalName": "receipt.hbs",
      "templateName": "receipt",
      "status": "error",
      "message": "Failed to save template",
      "error": "Disk full"
    }
  ]
}
```

**Status Codes:**

- `201`: All templates uploaded successfully
- `207`: Partial success (some succeeded, some failed/skipped)
- `400`: No files provided or invalid request
- `500`: Server error

## Template Name Generation

Template names are automatically generated from filenames:

- Original: `My-Invoice Template.hbs` → Generated: `my-invoice-template`
- Extension removal: `.hbs` and `.handlebars` extensions are removed
- Sanitization: Special characters replaced with hyphens
- Lowercase conversion: All names converted to lowercase

## Error Handling

Each file is processed independently. Possible statuses per file:

- **success**: Template uploaded/updated successfully
- **error**: Failed to process (disk error, invalid content, etc.)
- **skipped**: Template exists and overwrite is disabled

## Implementation Details

### New TypeScript Interfaces

```typescript
interface BulkTemplateUploadRequest extends Request {
  files?:
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] };
  body: {
    overwrite: string;
    pageToken: string;
  };
}

interface TemplateUploadResult {
  originalName: string;
  templateName: string;
  status: "success" | "error" | "skipped";
  message: string;
  error?: string;
}

interface BulkTemplateUploadResponse {
  status: "success" | "partial" | "error";
  message: string;
  totalFiles: number;
  successCount: number;
  errorCount: number;
  skippedCount: number;
  results: TemplateUploadResult[];
}
```

### Multer Configuration

```typescript
export const uploadBulk = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, callback) => {
    if (
      file.originalname.endsWith(".hbs") ||
      file.originalname.endsWith(".handlebars")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Only .hbs and .handlebars files are allowed"));
    }
  },
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB per file
    files: 20, // Maximum 20 files
  },
});
```

## Usage Examples

### Using curl

```bash
# Upload multiple templates with overwrite enabled
curl -X POST http://localhost:7070/api/templates/upload/bulk \
  -F "templateFiles=@invoice.hbs" \
  -F "templateFiles=@receipt.hbs" \
  -F "templateFiles=@resume.hbs" \
  -F "overwrite=true" \
  -F "pageToken=your-token"
```

### Using JavaScript/Fetch

```javascript
const formData = new FormData();
formData.append("templateFiles", file1);
formData.append("templateFiles", file2);
formData.append("templateFiles", file3);
formData.append("overwrite", "true");
formData.append("pageToken", "your-token");

const response = await fetch("/api/templates/upload/bulk", {
  method: "POST",
  body: formData,
});

const result = await response.json();
console.log(result);
```

## Testing

Use the provided test script to create sample templates:

```bash
node scripts/test-bulk-upload.js
```

This script:

1. Creates sample `.hbs` templates in `temp-templates/` directory
2. Provides curl commands for testing
3. Shows expected response format

## Security Considerations

- File type validation (only `.hbs` and `.handlebars`)
- File size limits (2MB per file, 20 files max)
- CSRF protection via pageToken
- Template name sanitization
- Memory storage (files processed in memory, not saved to temp disk)

## Performance Notes

- Files are processed sequentially to avoid resource conflicts
- Each file operation is independent (one failure doesn't stop others)
- Memory-based processing for security
- Detailed logging for troubleshooting

## Future Enhancements

- [ ] ZIP file upload support (extract and upload multiple templates)
- [ ] Template validation (Handlebars syntax checking)
- [ ] Batch template compilation testing
- [ ] Progress callbacks for large uploads
- [ ] Template dependency resolution
