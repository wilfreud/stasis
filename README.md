# PDF Generator

Express.js service that generates PDFs from Handlebars templates using Playwright headless browser.

## Features

- Generates PDFs from HTML templates with dynamic data injection
- Supports multiple output formats (invoices, thermal receipts)
- Built with TypeScript and Playwright for reliable rendering
- Docker-ready for deployment
- Benchmarking middleware for performance monitoring

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
│   ├── index.ts                 # Server & routes
│   ├── mockdata.ts              # Sample data
│   ├── middlewares/
│   │   └── benchmark.middleware.ts
│   ├── services/
│   │   ├── handlebars.service.ts
│   │   └── playwright.service.ts
│   └── templates/
│       ├── receipt.hbs
│       ├── thermal-receipt.hbs
│       └── invoice-tailwind.hbs
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

| Endpoint                | Description      | Format |
| ----------------------- | ---------------- | ------ |
| `GET /`                 | API info         | -      |
| `GET /generate-pdf`     | Standard invoice | A4     |
| `GET /generate-receipt` | Thermal receipt  | A5     |

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
3. Add the template to the service by creating a new route in `src/index.ts`

## 🧪 Data Structure

The service works with a standard data structure for invoices and receipts:

```typescript
{
  invoiceNumber: string;
  date: string;
  dueDate: string;
  company: {
    name: string;
    address: string;
    phone?: string;
    email: string;
    website?: string;
  };
  client: {
    name: string;
    address: string;
    email: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: string;
    total: string;
    details?: string;
  }>;
  tax?: string;
  taxRate?: string;
  subtotal: string;
  totalAmount: string;
  paymentMethod?: string;
  paymentTerms: string;
}
```

## 📝 License

ISC License

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
