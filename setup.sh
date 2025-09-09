#!/bin/bash

# Family Budgeting App Setup Script
echo "🚀 Setting up Family Budgeting App..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Python and Node.js are installed"

# Backend Setup
echo "📦 Setting up backend..."

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

echo "✅ Backend setup complete"

# Frontend Setup
echo "📦 Setting up frontend..."

cd frontend
npm install

echo "✅ Frontend setup complete"

# Create superuser prompt
echo ""
echo "🎉 Setup complete!"
echo ""
echo "To get started:"
echo "1. Create a superuser account:"
echo "   source venv/bin/activate"
echo "   python manage.py createsuperuser"
echo ""
echo "2. Start the backend server:"
echo "   source venv/bin/activate"
echo "   python manage.py runserver"
echo ""
echo "3. Start the frontend server (in a new terminal):"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "Happy budgeting! 💰"
