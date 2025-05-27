# Copilot General Contribution Guidelines

## Overview

This project values maintainability, modularity, and a clean development environment. When generating code or suggestions, Copilot should:

## General Principles

- Provide code that is **modular** and easy to integrate
- Avoid monolithic solutions; prefer separation of concerns
- Respect the **existing project structure** and file organization
- Do not introduce breaking changes or disrupt current workflows
- Use **TypeScript** for all new code unless otherwise specified
- Prefer interfaces and types for all data structures
- Avoid use of `any` unless absolutely necessary and justified

## File & Directory Structure

- Place type definitions in types foder
- Do not move or rename existing files unless explicitly requested
- Do not introduce new root-level files unless necessary for project-wide configuration

## Code Quality

- Write concise, readable, and well-typed code
- Use small, single-responsibility functions
- Use async/await for asynchronous operations
- Add JSDoc for all public functions and interfaces
- Avoid excessive inline comments; prefer self-documenting code

## Error Handling

- Always wrap async operations in try/catch
- Return meaningful error messages and status codes

## Integration

- When adding new features, create new files or extend existing ones in the appropriate directory
- Do not modify unrelated files
- Ensure new code does not break existing endpoints or features

## Commit Messages

- Use [conventional commit](https://www.conventionalcommits.org/) style for all commits

## Environment Safety

- Do not alter Docker, build, or deployment files unless the change is directly related to the feature or fix being implemented
- Avoid introducing dependencies that conflict with the current stack

## When in Doubt

- Ask for clarification before making structural or architectural changes
- Default to the least disruptive approach
