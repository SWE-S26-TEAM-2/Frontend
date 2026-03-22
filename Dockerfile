FROM node:20-alpine

WORKDIR /app

# Copy dependency files
COPY media/package*.json ./

# Install dependencies
RUN npm ci

# Copy project source
COPY media/ .

# Build Next.js app
RUN npm run build

# Expose Next.js port
EXPOSE 3000

# Start production server
CMD ["npx", "next", "start"]
