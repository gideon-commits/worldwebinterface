#!/bin/bash

# Build script for the waitlist app
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo "Build complete! Run 'cd backend && python main.py' to start the combined app."
