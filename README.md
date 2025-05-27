# Stasis

![Stasis Logo](public/stasis.png)

A high-performance (well, still gotta benchmark first), RESTful Express.js "microservice" (arguably) for generating PDF documents from Handlebars templates using Playwright headless browser.

## Features

- RESTful API architecture following standard conventions
- Converts HTML templates into PDFs with dynamic data injection
- Supports both predefined Handlebars templates and raw HTML input
- Fully typed TypeScript implementation with robust error handling
- Built with Playwright for consistent cross-platform rendering
- Docker-ready for containerized deployment
- Comprehensive performance monitoring middleware

## Technology Stack

| Category             | Technology   | Purpose                                          |
| -------------------- | ------------ | ------------------------------------------------ |
| **Backend**          | Express.js   | HTTP server and API framework                    |
| **Rendering**        | Playwright   | Headless browser for PDF generation              |
| **Templating**       | Handlebars   | Template engine for dynamic HTML                 |
| **Language**         | TypeScript   | Type-safe JavaScript superset                    |
| **Package Mgmt**     | PNPM         | Fast, disk-efficient package manager             |
| **Containerization** | Docker       | Application containerization                     |
| **Styling**          | Tailwind CSS | Utility-first CSS framework for template styling |

## Project Structure

```
pdf-generator/
├── src/
│   ├── index.ts                     # Server entry point
│   ├── mockdata.ts                  # Sample data for testing
│   ├── controllers/
│   │   └── index.ts                 # HTTP request handlers with response logic
│   ├── middlewares/
│   │   └── benchmark.middleware.ts  # Performance monitoring middleware
│   ├── services/
│   │   ├── handlebars.service.ts    # Template compilation service
│   │   └── playwright.service.ts    # PDF generation and browser management
│   ├── templates/
│   │   └── thermal-receipt.hbs      # Predefined Handlebars templates
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces and type definitions
│   └── utils/
│       └── dto.utils.ts             # Data validation utilities
├── Dockerfile                       # Container definition
└── compose.yaml                     # Multi-container orchestration
```

## Getting Started

### Prerequisites

- Node.js v18+ (LTS recommended)
- PNPM package manager
- Docker (optional, for containerized deployment)

### Development Setup

```bash
# Install dependencies
pnpm install

# Run development server with hot reloading
pnpm dev

# Build production artifacts
pnpm build

# Start production server
pnpm start
```

## REST API Reference

### PDF Generation Endpoints

| Endpoint              | Method | Description                   | Request Body              | Response           |
| --------------------- | ------ | ----------------------------- | ------------------------- | ------------------ |
| `/api/health`         | GET    | Service health status         | -                         | `application/json` |
| `/api/documents`      | POST   | Generate PDF from template    | Template options and data | `application/pdf`  |
| `/api/documents/raw`  | POST   | Generate PDF from raw HTML    | HTML content and data     | `application/pdf`  |
| `/api/documents/test` | GET    | Test PDF generation (receipt) | -                         | `application/pdf`  |

### Template Management Endpoints

| Endpoint                | Method | Description                  | Request Body                          | Response           |
| ----------------------- | ------ | ---------------------------- | ------------------------------------- | ------------------ |
| `/api/templates/list`   | GET    | List all available templates | -                                     | `application/json` |
| `/api/templates/upload` | POST   | Upload a new template        | multipart/form-data (file + metadata) | `application/json` |
| `/api/templates/delete` | DELETE | Delete an existing template  | JSON with template name               | `application/json` |

### Request Body Examples

#### `POST /api/templates/upload` - Upload a Template

This endpoint accepts `multipart/form-data` with the following fields:

```
templateName: "invoice"      // Name to identify the template (without extension)
templateFile: [Binary File]  // .hbs or .handlebars file content
overwrite: "true"            // Optional boolean to allow overwriting existing templates
```

#### `DELETE /api/templates/delete` - Delete a Template

```json
{
  "templateName": "invoice" // Name of the template to delete (without extension)
}
```

#### `POST /api/documents` - Generate PDF from Template

```json
{
  "templateId": "thermal-receipt",
  "data": {
    "invoiceNumber": "twA63I31dsrG0V",
    "date": "2025-05-26",
    "dueDate": "2025-06-25",
    "company": {
      "name": "HIBOUTIK",
      "address": "30 place du Centre, 01234 MAVILLE",
      "phone": "01 23 45 67 89",
      "website": "hiboutik",
      "email": "contact@hiboutik.com"
    },
    "client": {
      "name": "Pierre",
      "address": "456 Client Ave, Business City, BC 67890",
      "email": "accounts@acme.com"
    },
    "items": [
      {
        "description": "Pizza",
        "quantity": 1,
        "unitPrice": "12.00",
        "total": "12.00"
      }
    ],
    "tax": "0.63",
    "taxRate": "5.5",
    "totalAmount": "12.00",
    "subtotal": "12.00",
    "paymentMethod": "ESP",
    "amountGiven": "15.00",
    "amountReturned": "3.00",
    "ticketNumber": "5232",
    "paymentTerms": "Net 30 days"
  },
  "pdfOptions": {
    "format": "A4",
    "margin": {
      "top": "1cm",
      "bottom": "1cm"
    }
  },
  "outputFileName": "invoice.pdf"
}
```

#### `POST /api/documents/raw` - Generate PDF from Raw HTML

```json
{
  "rawHtml": "<html><body><h1>{{title}}</h1></body></html>",
  "data": {
    "title": "My Document"
  },
  "pdfOptions": {
    "format": "A4"
  },
  "outputFileName": "document.pdf"
}
```

### Response Formats

#### Success Responses

- **PDF Generation**: Returns the PDF binary with `Content-Type: application/pdf` and appropriate filename headers
- **Template Management**: Returns JSON status and result information with appropriate HTTP status codes
- **Health Check**: Returns JSON status information with HTTP 200

```json
// Health check response
{
  "status": "OK",
  "service": "Playwright based PDF generator",
  "timestamp": "2025-05-27T10:15:30.123Z"
}

// Template upload success response
{
  "status": "success",
  "message": "Template 'invoice' has been created"
}

// Template list response
["thermal-receipt", "invoice", "report"]
```

#### Error Responses

All error responses follow a consistent format with HTTP status codes:

```json
{
  "status": "error",
  "message": "Failed to generate PDF document",
  "error": "Template compilation error: Invalid syntax at line 12"
}
```

## Deployment Options

### Docker Deployment

The service includes Docker configuration for containerized deployment in any environment.

```bash
# Build the Docker image
docker build -t pdf-generator .

# Run the container with port mapping
docker run -p 7070:7070 pdf-generator
```

### Docker Compose

For multi-container deployments or complex configurations:

```bash
# Start with Docker Compose
docker compose up

# Run in detached mode for production
docker compose up -d

# View container logs
docker compose logs -f
```

The Docker Compose configuration includes a named volume to persist templates, ensuring that uploaded templates are not lost when containers are recreated:

```yaml
volumes:
  - pdf_templates:/app/templates # Use named volume for template persistence

volumes:
  pdf_templates:
    # Named volume for templates that persists across container recreations
```

Using a named volume provides better portability and proper Docker-managed lifecycle for your template files.

For more details on testing template persistence, see [DOCKER-PERSISTENCE.md](DOCKER-PERSISTENCE.md).

## Template Development

### Handlebars Integration

Templates can be developed using Handlebars syntax and registered with the service. The framework supports:

- **Standard templates**: Stored in `templates/` directory (or path specified by TEMPLATES_DIR environment variable)
- **Custom templates**: Sent directly in API requests
- **Dynamic data binding**: Any JSON object structure can be rendered
- **Nested objects**: Access deeply nested properties with dot notation

### Available Helpers

The service extends Handlebars with additional helper functions:

| Helper        | Purpose                    | Example Usage                        |
| ------------- | -------------------------- | ------------------------------------ |
| `capitalize`  | Capitalize first letter    | `{{capitalize name}}`                |
| `uppercase`   | Convert to uppercase       | `{{uppercase text}}`                 |
| `lowercase`   | Convert to lowercase       | `{{lowercase text}}`                 |
| `formatDate`  | Format dates with date-fns | `{{formatDate date "yyyy-MM-dd"}}`   |
| `gt`          | Greater than comparison    | `{{#if (gt value 10)}}...{{/if}}`    |
| `or`          | Logical OR operation       | `{{#if (or cond1 cond2)}}...{{/if}}` |
| `currentDate` | Get current date           | `{{currentDate "yyyy-MM-dd"}}`       |

### Template Creation Process

1. Create a new `.hbs` file in the templates directory (e.g., `invoice.hbs`)
2. Use Handlebars syntax for dynamic content injection
3. Include any required CSS for styling (inline or via Tailwind)
4. Use the template by referencing its ID in API calls: `"templateId": "invoice"`

## Architecture & Design

### Component Architecture

The service follows a modern, layered architecture with clean separation of concerns:

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Controller │ ──── │   Service   │ ──── │  Playwright │
│   (Express) │      │   (Logic)   │      │  (Browser)  │
└─────────────┘      └─────────────┘      └─────────────┘
       │                    │                    │
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│    Types    │      │ Handlebars  │      │    Utils    │
│ (Interfaces)│      │ (Templates) │      │  (Helpers)  │
└─────────────┘      └─────────────┘      └─────────────┘
```

### REST API Design Principles

- **Resource-Oriented**: API endpoints focus on resources (documents) not actions
- **Standard HTTP Methods**: POST for creation, GET for retrieval
- **Consistent Response Formats**: Standard error and success response structures
- **Proper Status Codes**: 201 for creation, 400 for validation errors, etc.
- **Content Negotiation**: Supports both JSON and PDF responses

### Performance Considerations

- **Browser Instance Management**: Reuse of Playwright browser instances
- **Template Compilation Caching**: Optimization for repeated template use
- **Asynchronous Processing**: Full async/await implementation
- **Binary Response Streaming**: Efficient delivery of PDF documents
- **Comprehensive Error Handling**: Graceful degradation and detailed error information

## Monitoring & Maintenance

The service includes built-in performance monitoring that tracks:

- Request processing time
- Template compilation time
- PDF rendering duration
- Memory usage statistics

## License

ISC License

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For major changes, please open an issue first to discuss proposed changes.

## Template Management UI

The service includes a web-based template management interface that allows users to:

1. Upload new Handlebars templates
2. View existing templates
3. Delete templates when no longer needed

When running in Docker, templates are persisted to the host machine through a volume mapping, ensuring they remain available even after container restarts or rebuilds.

To access this interface, navigate to the root URL of the service in a web browser:

```
http://localhost:7070
```

### Security Features

The template management interface includes security features to prevent unauthorized template uploads:

- Token-based authentication between the frontend and API
- File extension validation (only `.hbs` and `.handlebars` files)
- File size limits (max 2MB)
- Protection against template overwriting (optional toggle)
- Input validation and sanitization for template names

### Using the Template Manager

1. **View Templates**: All existing templates are displayed in a list
2. **Upload Template**:
   - Enter a template name (without extension)
   - Select a `.hbs` file or drag and drop
   - Choose whether to overwrite existing templates
3. **Delete Template**: Click the delete button next to any template in the list
