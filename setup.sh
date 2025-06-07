#!/bin/bash

# Remove old lock file and node_modules
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock
rm -f pnpm-lock.yaml

# Install dependencies with npm
npm install

# Build the project to verify everything works
npm run build
