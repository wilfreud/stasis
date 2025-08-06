# Stasis - AI Coding Agent Instructions

## Project Overview

Stasis is a TypeScript PDF generation microservice using Express.js + Playwright + Handlebars. It follows a modular service-oriented architecture with strict separation between controllers (HTTP), services (business logic), and middlewares.

## Architecture Patterns

### Service Singleton Pattern

- `BrowserManagerService` maintains a single Playwright browser instance across requests
- `HandlebarsService` pre-compiles templates and registers custom helpers (formatDate, capitalize, etc.)
- Services are instantiated once in controllers and reused across requests

### ES Modules + Path Aliasing

- Project uses `"type": "module"` - all imports must use `.js` extensions even for `.ts` files
- Path aliasing via `@/` prefix maps to `src/` (configured in tsconfig)
- Build script (`scripts/build-fix.js`) copies package.json to dist/ with imports configuration

### TypeScript Interface Patterns

- All request/response types extend Express interfaces (see `src/types/index.ts`)
- File upload requests use Multer's union types requiring type guards
- Example: `BulkTemplateUploadRequest.files` can be array or object

## Critical Workflows

### Development

```bash
pnpm dev        # tsx --watch (hot reload)
pnpm test       # vitest run (unit tests in *.test.ts files)
pnpm format     # prettier on src/**/*.ts
```

### Build Process

1. `pnpm build` runs TypeScript compilation + `build-fix.js`
2. Build script adds path import mappings to `dist/package.json`
3. Production uses `node dist/index.js` (no tsx)

### Docker Deployment

- Multi-stage build using `mcr.microsoft.com/playwright:v1.52.0` base
- Templates persist via Docker volumes at `/app/templates`
- Playwright browsers pre-installed in container

## File Organization Conventions

### Controllers (`src/controllers/`)

- HTTP request/response handling only
- Import services as singletons: `const browserManagerService = new BrowserManagerService()`
- Error responses follow `{ status: "error", message: string, error?: string }` format

### Services (`src/services/`)

- Pure business logic, no Express dependencies
- `playwright.service.ts`: Browser lifecycle, PDF generation with options
- `handlebars.service.ts`: Template compilation, helper registration

### Types (`src/types/`)

- All interfaces extend Express base types
- Multer file handling requires union type guards
- PDF options pass through to Playwright's `page.pdf()` method

### Templates (`templates/`)

- `.hbs` or `.handlebars` extensions supported
- File naming convention: lowercase with hyphens (`thermal-receipt.hbs`)
- Handlebars helpers available: `formatDate`, `capitalize`, `lowercase`, `uppercase`

## API Patterns

### RESTful Endpoints

- `/api/documents` - PDF generation from templates
- `/api/templates/*` - Template CRUD operations (list, upload, download, delete)
- All POST endpoints expect JSON or multipart/form-data

### Request/Response Flow

1. Middleware: benchmark timing (`benchmark.middleware.ts`)
2. Controller: validation + service calls
3. Service: business logic (template compilation, PDF rendering)
4. Response: JSON metadata or PDF binary with proper headers

### Bulk Operations

- Template uploads support up to 20 files (configured in multer middleware)
- Responses include detailed per-file results with status: `success|error|skipped`
- Checksums endpoint returns SHA-256 hashes for template integrity

## Project-Specific Conventions

### Error Handling

- Always wrap service calls in try/catch at controller level
- Return consistent error format with HTTP status codes
- Log errors to console with context

### File Operations

- Use `fs/promises` for async file operations
- Templates directory configurable via `TEMPLATES_DIR` env var
- File existence checks use `existsSync()` before operations

### Testing Strategy

- Unit tests co-located with services (`.test.ts` suffix)
- Vitest config targets Node.js environment
- Mock data available in `src/mockdata.ts`

## Development Notes

- PowerShell is the target shell environment (Windows-focused)
- PNPM is the required package manager (not npm/yarn)
- Playwright requires specific Chrome args for containerized environments
- Template names auto-generated from filenames (sanitized, lowercase)
- **ALWAYS UPDATE THE README.md IF IMPORTANT CHANGES ARE MADE, FINALIZED AND ACCEPTED**
