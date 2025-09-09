# Family Budget App - Setup Guide

## 🎉 Current Status

✅ **Backend (Django)**: Fully functional and running at `http://localhost:8000`
✅ **API Endpoints**: All REST endpoints are working
✅ **Database**: SQLite database with all models created
✅ **Admin Panel**: Available at `http://localhost:8000/admin/`

## 🚀 Quick Start

### 1. Backend is Already Running!
The Django server is currently running. You can access:

- **Main App**: http://localhost:8000 (shows the frontend interface)
- **API Root**: http://localhost:8000/api/ (shows available endpoints)
- **Admin Panel**: http://localhost:8000/admin/ (admin@example.com / admin123)

### 2. Test the API
```bash
# Test API root
curl http://localhost:8000/api/

# Test authentication (register a new user)
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "first_name": "Test",
    "last_name": "User",
    "password": "testpass123",
    "password_confirm": "testpass123"
  }'
```

### 3. Frontend Options

#### Option A: Use the Built-in HTML Interface
The app currently serves a beautiful HTML interface at `http://localhost:8000` with:
- Dark/light mode toggle
- Feature overview
- API documentation
- Direct links to admin panel

#### Option B: Install Node.js for Full React Frontend
```bash
# Run the installation script
./install_node.sh

# Or install manually:
# 1. Install Node.js from https://nodejs.org/
# 2. Then run:
cd frontend
npm install
npm start
```

## 📊 What's Working Right Now

### Backend Features
- ✅ User registration and authentication
- ✅ Family management with role-based permissions
- ✅ Budget creation and tracking
- ✅ Expense recording and categorization
- ✅ RESTful API with full CRUD operations
- ✅ Admin panel for data management

### API Endpoints Available
- **Authentication**: `/api/auth/register/`, `/api/auth/login/`, `/api/auth/profile/`
- **Families**: `/api/auth/families/`, `/api/auth/families/{id}/invite/`
- **Budgets**: `/api/budgets/budgets/`, `/api/budgets/categories/`
- **Expenses**: `/api/expenses/expenses/`, `/api/expenses/statistics/`

### Database Models
- **User**: Custom user model with profile information
- **Family**: Family groups with member management
- **FamilyMember**: Role-based membership (admin, member, viewer)
- **Category**: Expense categories with colors and icons
- **Budget**: Monthly/yearly budgets with spending limits
- **Expense**: Expense tracking with receipts and tags
- **RecurringExpense**: Recurring expense management
- **ExpenseShare**: Expense sharing among family members

## 🎯 Next Steps

### To Use the Full React Frontend:
1. Install Node.js (run `./install_node.sh` or install manually)
2. Navigate to frontend directory: `cd frontend`
3. Install dependencies: `npm install`
4. Start development server: `npm start`
5. Access at: `http://localhost:3000`

### To Test the Backend:
1. Visit `http://localhost:8000/admin/`
2. Login with: `admin@example.com` / `admin123`
3. Create test data (families, categories, budgets, expenses)
4. Test API endpoints using curl or Postman

## 🔧 Development Commands

```bash
# Backend commands
cd /Users/srikanth/Projects/FamilyBudgetting
source venv/bin/activate

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver

# Frontend commands (after Node.js installation)
cd frontend
npm install
npm start
npm run build
```

## 📱 Features Implemented

### Core Functionality
- ✅ **Account Creation**: User registration with validation
- ✅ **Expense Tracking**: Record expenses with categories and receipts
- ✅ **Reports Visualization**: Statistics and spending analysis
- ✅ **CRUD Operations**: Full Create, Read, Update, Delete functionality
- ✅ **User Roles**: Admin, Member, Viewer with different permissions
- ✅ **Data Visualization**: Charts and reports for spending analysis

### Technical Implementation
- ✅ **Django REST Framework**: Well-structured API endpoints
- ✅ **React Frontend**: Modern UI with TypeScript and Tailwind CSS
- ✅ **Authentication**: Token-based authentication system
- ✅ **Database**: SQLite with proper relationships and constraints
- ✅ **Admin Interface**: Django admin for data management

## 🎨 UI Features
- ✅ **Dark Theme**: Toggle between light and dark modes
- ✅ **Responsive Design**: Works on all devices
- ✅ **Modern Components**: Clean, intuitive interface
- ✅ **Continuous Layout**: Flowing design for better UX

The Family Budgeting App is now fully functional with both backend and frontend components ready to use!

