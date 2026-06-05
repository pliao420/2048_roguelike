#!/bin/bash
cd "$(dirname "$0")"
echo "🎮 2048 Roguelike Server"
echo "========================"
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi
node server.js
