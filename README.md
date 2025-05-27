# PDF Generator

Express.js service that generates PDFs from Handlebars templates using Playwright headless browser.

## Features

- Converts HTML templates into PDFs with dynamic data injection
- Supports flexible data structures defined by the client
- Built with TypeScript and Playwright for reliable rendering
- Docker-ready for deployment
- Includes middleware for performance monitoring

## Stack

- Express.js
- Playwright
- Handlebars
- TypeScript
- PNPM
- Docker
- Tailwind CSS

## Structure

```
pdf-generator/
├── src/
│   ├── index.ts                     # Server entry point
│   ├── mockdata.ts                  # Sample data
│   ├── controllers/
│   │   └── index.ts                 # HTTP request handlers
│   ├── middlewares/
│   │   └── benchmark.middleware.ts  # Performance monitoring
│   ├── services/
│   │   ├── handlebars.service.ts    # Template compilation
│   │   └── playwright.service.ts    # PDF generation
│   ├── templates/
│   │   └── thermal-receipt.hbs      # Handlebars templates
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces
│   └── utils/
│       └── dto.utils.ts             # Validation utilities
├── Dockerfile
└── compose.yaml
```

## Getting Started

### Prerequisites

- Node.js v18+
- PNPM
- Docker (optional)

### Development

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Build
pnpm build
```

## API

| Endpoint        | Method | Description                   | Content-Type     |
| --------------- | ------ | ----------------------------- | ---------------- |
| `/`             | GET    | Health check & API info       | application/json |
| `/test`         | GET    | Test PDF generation (receipt) | application/pdf  |
| `/generate-pdf` | POST   | Generate PDF from template    | application/pdf  |
| `/generate-raw` | POST   | Generate PDF from raw HTML    | application/pdf  |

### Request Body Examples

#### `/generate-pdf` - Template-based generation:

```json
{
  "templateId": "thermal-receipt",
  "data": {
    "invoiceNumber": "INV-001",
    "date": "2024-01-15",
    "company": {
      "name": "Acme Corp",
      "address": "123 Main St"
    }
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

#### `/generate-raw` - Raw HTML generation:

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

## 📦 Docker Deployment

Build the Docker image:

```bash
docker build -t pdf-generator .
```

Run the container:

```bash
docker run -p 7070:7070 pdf-generator
```

Or use Docker Compose:

```bash
docker-compose up
```

## 📄 Template Development

### Available Helpers

The service includes several Handlebars helpers:

- `capitalize`: Capitalize first letter of a string
- `uppercase`: Convert string to uppercase
- `lowercase`: Convert string to lowercase
- `formatDate`: Format dates with date-fns
- `gt`: Greater than comparison
- `or`: Logical OR operation
- `currentDate`: Get current date in various formats

### Creating New Templates

1. Create a new `.hbs` file in the `src/templates` directory
2. Use Handlebars syntax for dynamic content
3. Register the template in the controller by using the `templateId` parameter
4. Ensure your template data structure matches the expected interface

## Architecture

The service follows a clean separation of concerns:

- **Controllers** (`src/controllers/`): Handle HTTP requests and responses
- **Services** (`src/services/`): Business logic for PDF generation and template compilation
- **Types** (`src/types/`): TypeScript interfaces and type definitions
- **Utils** (`src/utils/`): Helper functions and validation utilities
- **Templates** (`src/templates/`): Handlebars template files

## 📝 License

ISC License

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
