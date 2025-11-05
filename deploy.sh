#!/bin/bash

echo "🚀 Building web app..."
bunx expo export -p web

echo "✅ Build complete!"
echo ""
echo "📦 Files are in the 'dist' folder"
echo ""
echo "🌐 To start the server, run:"
echo "   bun run server.ts"
echo ""
echo "📱 Your app will be available at:"
echo "   http://185.120.251.246:3000"
