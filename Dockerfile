# Stage 1: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Accept build arguments
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Copy package files first for better layer caching
COPY src/package*.json ./

# Install dependencies (this layer will be cached unless package.json changes)
RUN npm ci --prefer-offline --no-audit --quiet

# Copy source code (this layer only invalidates when code changes)
COPY src/ ./

# Build the application
RUN npm run build

# Stage 2: Runtime image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Runtime environment variables (set by Kubernetes)
ENV API_URL=""
ENV NEXT_PUBLIC_API_URL=""
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy startup script
COPY start-server.sh ./start-server.sh
RUN chmod +x ./start-server.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./start-server.sh"]
