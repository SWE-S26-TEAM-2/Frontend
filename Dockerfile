FROM --platform=linux/arm64 node:20-alpine

WORKDIR /app

COPY media/package*.json ./
RUN npm ci

COPY media/ .

ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=placeholder-for-ci-build
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID

ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

EXPOSE 3000

CMD ["npx", "next", "start"]
