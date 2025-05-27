ARG NODE_VERSION=20
ARG PNPM_VERSION=10.11.0

FROM node:${NODE_VERSION}-bookworm-slim

# Use production node environment
ENV NODE_ENV=production

# Install pnpm
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@${PNPM_VERSION}

WORKDIR /app

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml ./

# Install all dependencies and build in one go
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build the TypeScript application
RUN pnpm build

# Run the build fix script to add path aliases
RUN node scripts/build-fix.js

# Clean up dev dependencies to save space (optional)
RUN pnpm prune --prod

# Create node user and set permissions
RUN mkdir -p /home/node && \
    mkdir -p /app/src/templates && \
    chown -R node:node /home/node /app

# Switch to node user
USER node

# Expose the port
EXPOSE 7070

# Run the application
ENTRYPOINT [ "node", "dist/index.js" ]
