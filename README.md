# Family Budgeting App

A comprehensive family budgeting application built with Django REST Framework backend and React TypeScript frontend. This app helps families manage their finances, track expenses, set budgets, and monitor spending across different categories.

## 🚀 Features

### Core Functionality
- **User Authentication** - Secure login/registration system
- **Family Management** - Create and manage family groups with multiple members
- **Expense Tracking** - Record and categorize daily expenses
- **Budget Management** - Set and monitor budgets for different categories
- **Currency Support** - Account-wide currency settings with 50+ supported currencies
- **Dashboard** - Overview of spending, budgets, and financial health

### Advanced Features
- **Recurring Expenses** - Set up automatic recurring expense tracking
- **Expense Sharing** - Split expenses among family members
- **Category Management** - Custom expense categories with colors and icons
- **Payment Methods** - Track different payment methods (cash, cards, etc.)
- **Receipt Upload** - Attach receipt images to expenses
- **Tags System** - Flexible tagging for better expense organization
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## 🛠️ Technology Stack

### Backend
- **Django 4.2.7** - Web framework
- **Django REST Framework** - API development
- **SQLite** - Database (easily configurable for PostgreSQL/MySQL)
- **Django Auth Token** - Authentication system
- **Pillow** - Image processing for receipts

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Heroicons** - Beautiful SVG icons
- **Axios** - HTTP client for API calls

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd FamilyBudgetting
```

### 2. Backend Setup

#### Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Database Setup
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

#### Run Backend Server
```bash
python manage.py runserver
```
The backend will be available at `http://localhost:8000`

### 3. Frontend Setup

#### Navigate to Frontend Directory
```bash
cd frontend
```

#### Install Dependencies
```bash
npm install
```

#### Run Frontend Development Server
```bash
npm start
```
The frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
FamilyBudgetting/
├── accounts/                 # User authentication and family management
│   ├── models.py            # User, Family, FamilyMember models
│   ├── serializers.py       # API serializers
│   ├── views.py             # API views
│   └── urls.py              # URL routing
├── budgets/                 # Budget and category management
│   ├── models.py            # Budget, Category models
│   ├── serializers.py       # API serializers
│   ├── views.py             # API views
│   └── urls.py              # URL routing
├── expenses/                # Expense tracking
│   ├── models.py            # Expense, RecurringExpense models
│   ├── serializers.py       # API serializers
│   ├── views.py             # API views
│   └── urls.py              # URL routing
├── frontend/                # React frontend application
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service functions
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── package.json         # Frontend dependencies
│   └── tsconfig.json        # TypeScript configuration
├── family_budget/           # Django project settings
│   ├── settings.py          # Django settings
│   ├── urls.py              # Main URL configuration
│   └── wsgi.py              # WSGI configuration
├── manage.py                # Django management script
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
```

### Frontend Configuration
The frontend is configured to connect to the backend API at `http://localhost:8000/api` by default. You can modify this in `frontend/src/services/api.ts`.

## 📱 Usage

### Getting Started
1. **Register** - Create a new account
2. **Create Family** - Set up your family group
3. **Add Categories** - Create expense categories (Food, Transportation, etc.)
4. **Set Budgets** - Define monthly/yearly budgets for categories
5. **Track Expenses** - Record daily expenses and attach receipts
6. **Monitor Progress** - Use the dashboard to track spending vs budgets

### Key Features Usage

#### Currency Settings
- Go to Settings → Currency Settings
- Select your preferred currency
- All amounts throughout the app will display in your selected currency

#### Budget Management
- Create budgets for different categories and time periods
- Monitor spending progress with visual indicators
- Edit or delete budgets as needed

#### Expense Tracking
- Add expenses with categories, payment methods, and tags
- Upload receipt images for record keeping
- View, edit, or delete expense records

## 🧪 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile
- `PATCH /api/auth/profile/` - Update user profile

### Families
- `GET /api/auth/families/` - List user's families
- `POST /api/auth/families/` - Create new family
- `GET /api/auth/families/{id}/members/` - List family members

### Budgets
- `GET /api/budgets/budgets/` - List budgets
- `POST /api/budgets/budgets/` - Create budget
- `GET /api/budgets/budgets/{id}/` - Get budget details
- `PUT /api/budgets/budgets/{id}/` - Update budget
- `DELETE /api/budgets/budgets/{id}/` - Delete budget

### Expenses
- `GET /api/expenses/expenses/` - List expenses
- `POST /api/expenses/expenses/` - Create expense
- `GET /api/expenses/expenses/{id}/` - Get expense details
- `PUT /api/expenses/expenses/{id}/` - Update expense
- `DELETE /api/expenses/expenses/{id}/` - Delete expense

## 🚀 Deployment

### Backend Deployment
1. Set up a production database (PostgreSQL recommended)
2. Configure environment variables for production
3. Set `DEBUG=False` in settings
4. Run `python manage.py collectstatic`
5. Deploy using your preferred method (Docker, Heroku, etc.)

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy the `build` folder to your static hosting service
3. Update API URLs for production environment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced reporting and analytics
- [ ] Bank account integration
- [ ] Bill reminders and notifications
- [ ] Investment tracking
- [ ] Multi-language support
- [ ] Dark/light theme toggle
- [ ] Data export functionality

---

**Happy Budgeting! 💰**