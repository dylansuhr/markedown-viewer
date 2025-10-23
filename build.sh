#!/bin/bash

echo "Building Markdown Viewer for Mac..."

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build the app without code signing (for distribution outside App Store)
echo "Building distributable (unsigned)..."
npm run build:unsigned

echo ""
echo "✅ Build complete!"
echo "The .dmg file is in the 'dist' folder"
echo "You can share this .dmg file with others to install the app"
