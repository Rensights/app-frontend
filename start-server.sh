#!/bin/sh
# Startup script to ensure environment variables are available
# This script runs before starting Next.js server

echo "=== Environment Variables ==="
echo "API_URL: ${API_URL:-not set}"
echo "NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-not set}"
echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:-not set}"
echo "============================"

# Start the Next.js server
exec node server.js









