# Simple Expense Tracker

A full-stack expense tracking application built with React, Express, and PostgreSQL.

## Features

- **Authentication System**: User registration, login, and password reset
- **Secure Access**: JWT-based authentication with refresh tokens
- **User-specific Data**: Each user sees only their own expenses
- Add expenses with amount, category, description, and date
- View all expenses in a table format
- Delete expenses
- Monthly spending total
- Category breakdown pie chart
- Recent expenses list
- Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + Chart.js
- **Backend**: Express.js + PostgreSQL + node-postgres
- **Database**: PostgreSQL

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database

### 1. Clone and Install Dependencies

```bash
# Navigate to the project
cd expense-tracker

# Install root dependencies
npm install

# Install client and server dependencies
npm install --workspace=client
npm install --workspace=server
```

### 2. Database Setup

1. Create a PostgreSQL database
2. Run the initial migration script:

```sql
-- Connect to your database and run:
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

3. Run the authentication tables setup:

```bash
cd server
node setup-auth-tables.js
```

This will create the necessary tables for user authentication:
- `users` - User accounts
- `refresh_tokens` - JWT refresh tokens
- `password_reset_tokens` - Password reset tokens
- Adds `user_id` column to `expenses` table

### 3. Environment Variables

Create a `.env` file in the `server` directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/expense_tracker
PORT=4002
NODE_ENV=development

# JWT Secrets (change these in production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Client URL for CORS
CLIENT_URL=http://localhost:5173
```

### 4. Run the Application

```bash
# Development mode (runs both client and server)
npm run dev

# Or run separately:
# Server (from server directory)
cd server && npm run dev

# Client (from client directory) 
cd client && npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:4002

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Expenses (Protected Routes)
- `GET /api/expenses` - Get user's expenses
- `POST /api/expenses` - Add new expense
- `DELETE /api/expenses/:id` - Delete user's expense
- `GET /api/expenses/stats` - Get user's analytics

## Project Structure

```
expense-tracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   ├── ForgotPasswordForm.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── context/        # React context
│   │   │   └── AuthContext.jsx
│   │   ├── pages/          # Page components
│   │   │   └── AuthPage.jsx
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── index.html
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   │   ├── auth.js     # Authentication routes
│   │   │   └── expenses.js # Expense routes
│   │   ├── middleware/     # Express middleware
│   │   │   └── auth.js     # JWT authentication
│   │   ├── utils/          # Utility functions
│   │   │   └── jwt.js      # JWT helpers
│   │   ├── db.js           # Database connection
│   │   └── server.js       # Express server
│   ├── migrations/         # SQL migration scripts
│   └── package.json
└── package.json           # Root package.json
```

## Categories

The app supports these expense categories:
- Food
- Transport
- Shopping
- Bills
- Other

## Authentication Features

### User Registration & Login
- Email/password authentication
- Password validation (minimum 6 characters)
- Secure password hashing with bcrypt
- JWT access tokens (15 minutes) and refresh tokens (7 days)
- Automatic token refresh on API calls

### Password Reset
- Email-based password reset flow
- Secure reset tokens with expiration
- In development, reset tokens are logged to console

### Security Features
- HTTP-only cookies for refresh tokens
- CORS protection
- Protected API routes
- User-specific data isolation

## Development

- The frontend runs on port 5173 with hot reload
- The backend runs on port 4002 with nodemon
- API requests from frontend are proxied to backend via Vite
- Authentication state is managed with React Context
- Automatic token refresh handles expired access tokens

## Deployment

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
# Deploy the dist/ folder
```

### Backend (Railway/Heroku)
```bash
cd server
# Set DATABASE_URL environment variable
npm start
```

## License

MIT
