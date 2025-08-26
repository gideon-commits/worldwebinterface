#!/bin/bash

# Render build script - builds both frontend and backend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Installing backend dependencies..."
cd backend
pip install -r requirements.txt

echo "Build complete!"
