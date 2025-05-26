ARG NODE_VERSION=20
ARG PNPM_VERSION=10.11.0

# Stage 1: Build the application
FROM node:${NODE_VERSION}-bookworm-slim AS builder

# Set development environment for building
ENV NODE_ENV=development

# Install pnpm.
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@${PNPM_VERSION}

WORKDIR /app

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including dev dependencies for building)
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build the TypeScript application
RUN pnpm build

# Stage 2: Production runtime
FROM node:${NODE_VERSION}-bookworm-slim AS runtime

# Use production node environment
ENV NODE_ENV=production

# Install pnpm.
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@${PNPM_VERSION}

WORKDIR /app

# Copy package files for production dependency installation
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --prod --frozen-lockfile --ignore-scripts

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy any other necessary files (templates, etc.)
COPY --from=builder /app/src/templates ./src/templates

# Create node user home directory and ensure proper permissions
RUN mkdir -p /home/node && chown -R node:node /home/node

# Install Playwright browsers as root but make them accessible to node user
RUN PLAYWRIGHT_BROWSERS_PATH=/home/node/.cache/ms-playwright pnpm playwright install chromium --with-deps

# Change ownership of the Playwright cache to node user
RUN chown -R node:node /home/node/.cache

# Run the application as a non-root user.
USER node

# Expose the port that the application listens on.
EXPOSE 7070

# Run the application.
ENTRYPOINT [ "node", "dist/index.js" ]