ARG NODE_VERSION=20
ARG PNPM_VERSION=10.11.0

# Build stage
FROM mcr.microsoft.com/playwright:v1.52.0 AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@${PNPM_VERSION}

# Leverage layer caching by copying package files first
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source code after installing dependencies
COPY . .
RUN pnpm run build && \
    node scripts/build-fix.js

# Production stage
FROM mcr.microsoft.com/playwright:v1.52.0
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@${PNPM_VERSION}

# Copy only the necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/templates ./templates
COPY --from=builder /app/public ./public

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Ensure templates directory exists and has correct permissions
RUN mkdir -p /app/templates && \
    chmod 777 /app/templates

# Set up user permissions (playwright image already has pwuser)
RUN chown -R pwuser:pwuser /app
USER pwuser

EXPOSE 7070
ENTRYPOINT ["node", "dist/index.js"]