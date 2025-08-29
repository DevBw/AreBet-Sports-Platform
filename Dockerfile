# ===============================================
# AREBET DOCKER CONFIGURATION
# Multi-stage build for production deployment
# ===============================================

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build arguments for environment variables
ARG REACT_APP_SUPABASE_URL
ARG REACT_APP_SUPABASE_ANON_KEY
ARG REACT_APP_RAPIDAPI_KEY
ARG REACT_APP_ENVIRONMENT=production

# Set environment variables
ENV REACT_APP_SUPABASE_URL=${REACT_APP_SUPABASE_URL}
ENV REACT_APP_SUPABASE_ANON_KEY=${REACT_APP_SUPABASE_ANON_KEY}
ENV REACT_APP_RAPIDAPI_KEY=${REACT_APP_RAPIDAPI_KEY}
ENV REACT_APP_ENVIRONMENT=${REACT_APP_ENVIRONMENT}
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy additional static assets
COPY --from=builder /app/public/sw.js /usr/share/nginx/html/sw.js
COPY --from=builder /app/public/manifest.json /usr/share/nginx/html/manifest.json

# Create nginx user and set permissions
RUN addgroup -g 1001 -S nginx && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Switch to non-root user
USER nginx

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Expose port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]