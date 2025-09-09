#!/bin/bash

# Family Budget App - Node.js Installation Script
echo "🚀 Family Budget App - Node.js Installation"
echo "============================================="

# Check if Node.js is already installed
if command -v node &> /dev/null; then
    echo "✅ Node.js is already installed: $(node --version)"
    echo "✅ npm is available: $(npm --version)"
    exit 0
fi

echo "📦 Node.js is not installed. Installing..."

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "🍺 Installing Homebrew first..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH for Apple Silicon Macs
    if [[ $(uname -m) == "arm64" ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
fi

# Install Node.js
echo "📦 Installing Node.js..."
brew install node

# Verify installation
if command -v node &> /dev/null; then
    echo "✅ Node.js installed successfully: $(node --version)"
    echo "✅ npm installed successfully: $(npm --version)"
    
    # Install frontend dependencies
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    
    echo ""
    echo "🎉 Installation complete!"
    echo "To start the frontend development server:"
    echo "  cd frontend"
    echo "  npm start"
    echo ""
    echo "The backend is already running at http://localhost:8000"
    echo "The frontend will be available at http://localhost:3000"
else
    echo "❌ Node.js installation failed. Please install manually:"
    echo "  1. Visit https://nodejs.org/"
    echo "  2. Download and install the LTS version"
    echo "  3. Run: cd frontend && npm install && npm start"
fi

