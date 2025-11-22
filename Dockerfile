# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files first (for better caching)
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy all source code
COPY . .

# Build the app
RUN pnpm run build

# Expose API port
EXPOSE 3000

# Run the app
CMD ["pnpm", "run", "start:prod"]
