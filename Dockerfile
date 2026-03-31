FROM node:20-alpine

WORKDIR /app

# Copy dependency 
COPY media/package*.json ./

# Install dependencies
RUN npm ci

# Copy project source
COPY media/ .

# Accept Google OAuth client ID for build-time prerendering
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=placeholder-for-ci-build
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID

# Build Next.js app
RUN npm run build

# Expose Next.js port
EXPOSE 3000

# Start production server
CMD ["npx", "next", "start"]
