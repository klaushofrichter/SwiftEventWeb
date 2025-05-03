#!/bin/bash
WORKER="cors-proxy"

# reading the secrets from .env

echo "deploying the worker according to the wrangler.toml file"
npx wrangler -v deploy


