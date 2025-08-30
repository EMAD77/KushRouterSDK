#!/bin/bash

# KushRouter SDK Installation Script
# This script helps you install the KushRouter SDK in your project

echo "🚀 KushRouter SDK Installation"
echo "================================"
echo ""

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ No package.json found. Please run this script in your project root."
    echo "💡 If this is a new project, run: npm init -y"
    exit 1
fi

# Detect package manager
if [ -f "yarn.lock" ]; then
    PACKAGE_MANAGER="yarn"
    INSTALL_CMD="yarn add"
elif [ -f "pnpm-lock.yaml" ]; then
    PACKAGE_MANAGER="pnpm"
    INSTALL_CMD="pnpm add"
elif [ -f "bun.lockb" ]; then
    PACKAGE_MANAGER="bun"
    INSTALL_CMD="bun add"
else
    PACKAGE_MANAGER="npm"
    INSTALL_CMD="npm install"
fi

echo "📦 Detected package manager: $PACKAGE_MANAGER"
echo ""

# Install the SDK
echo "⬇️  Installing KushRouter SDK..."
$INSTALL_CMD kushrouter-sdk

if [ $? -eq 0 ]; then
    echo "✅ KushRouter SDK installed successfully!"
else
    echo "❌ Installation failed. Please check your internet connection and try again."
    exit 1
fi

echo ""
echo "🎁 Next Steps:"
echo "1. Get your FREE $50 credits at: https://kushrouter.com"
echo "2. Generate your API key"
echo "3. Add to your .env file: KUSHROUTER_API_KEY=your_api_key_here"
echo ""
echo "📖 Quick Start:"
echo "import { createKushRouterSDK } from 'kushrouter-sdk';"
echo "const sdk = createKushRouterSDK({ apiKey: process.env.KUSHROUTER_API_KEY });"
echo "const response = await sdk.complete('Hello, AI!');"
echo ""
echo "📚 Documentation: https://kushrouter.com/docs"
echo ""
echo "Happy coding! 🎉"