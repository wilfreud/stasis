# GitHub Copilot Instructions

## Project Overview

Express.js service in TypeScript for HTML-to-PDF conversion using Playwright and Handlebars templating.

## Core Principles

- Provide **partial code snippets** to guide learning, not complete solutions
- Prioritize clean architecture and maintainable code
- Focus on TypeScript best practices and type safety

## Language & Typing Standards

- Use **TypeScript exclusively** – no plain JavaScript
- Implement **full type safety** with interfaces/types for all data structures
- **Never use `any`** – always provide proper typing
- Create interfaces for request/response objects, service parameters, and configuration

## Architecture Guidelines

```
src/
├── controllers/     # HTTP request handling only
├── services/        # Business logic and PDF generation
├── utils/           # Helper functions and shared utilities
└── types/           # Type definitions and interfaces
```

## Code Quality Standards

- Write **concise, readable code** with meaningful variable and function names
- Use **small, single-responsibility functions**
- Keep controllers thin – delegate business logic to services
- Implement lightweight dependency injection where practical
- Use `async/await` for all asynchronous operations
- Follow REST conventions for API endpoints

## Error Handling Patterns

```typescript
// Always wrap async operations in try/catch
try {
  const result = await service.generatePdf(data);
  return res.json(result);
} catch (error) {
  return res.status(500).json({
    error: "PDF generation failed",
    details: error.message,
  });
}
```

## Required Dependencies

- **Framework**: Express.js with TypeScript
- **PDF Generation**: Playwright (`playwright`)
- **Templating**: Handlebars (`hbs`)
  <!-- - **Validation**: Zod for request validation -->
  <!-- - **Testing**: Jest with TypeScript support -->
- **Code Quality**: ESLint + Prettier

## Playwright Guidelines

- Always close browser instances in `finally` blocks
- Use `page.pdf()` with proper options for consistent output
- Include brief explanatory comments for Playwright methods
- Handle browser launch failures gracefully

## Handlebars Integration

- Support both Handlebars templates and raw HTML input
- Compile templates once and reuse for performance
- Validate template data before rendering

## Documentation Requirements

- Add **concise JSDoc** for all public functions and interfaces
- Document function parameters, return types, and purpose
- Avoid excessive inline comments – prioritize self-documenting code
- Include usage examples for complex service methods

## Response Patterns

When suggesting code:

1. **Provide partial implementations** that require developer completion
2. **Include TODO comments** to guide next steps
3. **Show interface/type definitions** before implementation
4. **Suggest modular approaches** rather than monolithic solutions

## Validation Strategy

```typescript
// Use Zod schemas for request validation
const PdfRequestSchema = z.object({
  html: z.string().min(1),
  options: z
    .object({
      format: z.enum(["A4", "Letter"]).optional(),
      orientation: z.enum(["portrait", "landscape"]).optional(),
    })
    .optional(),
});
```

## Performance Considerations

- Reuse browser instances when possible
- Implement request timeouts
- Add basic caching for repeated template compilations
- Use streaming for large PDF responses

## Learning Focus Areas

When providing suggestions, emphasize:

- TypeScript type system usage
- Clean separation of concerns
- Error handling best practices
- Async/await patterns with Playwright
- Template compilation and reuse strategies

## Commit Conventions

- Use [conventional commit](https://www.conventionalcommits.org/) messages for all commits to enable automated changelog generation and maintain clear project history.
