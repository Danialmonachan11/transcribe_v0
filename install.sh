#!/bin/bash

echo "Installing Screen Docs dependencies..."
echo ""

echo "[1/3] Installing root dependencies..."
npm install concurrently || exit 1

echo ""
echo "[2/3] Installing web-app dependencies..."
cd web-app
npm install || exit 1

echo ""
echo "[3/3] Installing backend dependencies..."
cd ../backend
npm install || exit 1

cd ..

echo ""
echo "✓ All dependencies installed successfully!"
echo ""
echo "Run 'npm run dev' to start the application."
