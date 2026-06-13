# Wachemo University Non-Cafeteria Registration System

A full-stack web application for managing student non-cafeteria program registrations, document verification, approvals, and monthly compensation payments.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) |
| File Upload | Multer |
| Email | Nodemailer |
| PDF | PDFKit |
| Excel Export | xlsx |
| Charts | Recharts |

---

## 📁 Project Structure

```
wachemo-university-system/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, upload, error, audit
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API route definitions
│   ├── scripts/         # Seed scripts
│   ├── services/        # Email, PDF, notifications
│   ├── uploads/         # Uploaded files
│   ├── .env             # Environment variables
│   └── server.js        # App entry point
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI components
    │   ├── context/     # AuthContext, ThemeContext
    │   ├── hooks/       # useNotifications
    │   ├── layouts/     # StudentLayout, AdminLayout
    │   ├── pages/       # Auth, Student, Admin pages
    │   ├── services/    # Axios API calls
    │   └── utils/       # Helpers, constants
    ├── index.html
    └── vite.config.js
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone / open the project
```bash
cd wachemo-university-system
```

### 2. Backend setup
```bash
cd backend

# Install dependencies (already done)
npm install

# Configure environment
# Edit .env with your MongoDB URI, email, etc.

# Seed the admin account
npm run seed

# Start development server
npm run dev
```

### 3. Frontend setup
```bash
cd frontend

# Install dependencies (already done)
npm install

# Start development server
npm run dev
```

### 4. Access the application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api

---

## 🔐 Default Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@wachemo.edu.et | Admin@123456 |
| Student | Register via /register | Your chosen password |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Student registration |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| POST | /api/auth/forgot-password | Forgot password |
| POST | /api/auth/reset-password/:token | Reset password |
| PUT | /api/auth/change-password | Change password |

### Student
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/students/profile | Get student profile |
| PUT | /api/students/profile | Update profile |
| PUT | /api/students/profile/photo | Upload profile photo |
| GET | /api/students | Get all students (admin) |
| GET | /api/students/:id | Get student by ID (admin) |

### Applications
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/applications | Submit application |
| GET | /api/applications/my | Get my application |
| GET | /api/applications | Get all (admin) |
| GET | /api/applications/:id | Get by ID (admin) |
| PUT | /api/applications/:id/status | Update status (admin) |
| PUT | /api/applications/:id/checklist | Update checklist (admin) |
| GET | /api/applications/:id/letter | Download approval letter |

### Payments
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/payments/my | My payments |
| POST | /api/payments/generate | Generate monthly (admin) |
| GET | /api/payments | Get all payments (admin) |
| PUT | /api/payments/:id/pay | Mark as paid (admin) |
| GET | /api/payments/stats | Payment stats (admin) |
| GET | /api/payments/export/excel | Export Excel (admin) |
| GET | /api/payments/export/pdf | Export PDF (admin) |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/notifications | Get notifications |
| PUT | /api/notifications/read-all | Mark all as read |
| PUT | /api/notifications/:id/read | Mark as read |
| DELETE | /api/notifications/:id | Delete notification |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/admin/stats | Dashboard stats |
| GET | /api/admin/users | All users |
| PUT | /api/admin/users/:id/toggle | Toggle user status |
| GET | /api/admin/audit-logs | Audit logs |
| POST | /api/admin/notify | Broadcast notification |

---

## 🔧 Environment Variables (backend/.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wachemo_university
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@wachemo.edu.et
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=5242880
MONTHLY_COMPENSATION=3000
ADMIN_EMAIL=admin@wachemo.edu.et
ADMIN_PASSWORD=Admin@123456
```

---

## 📋 Application Workflow

1. **Student registers** → creates User + Student profile
2. **Student submits application** with documents + declaration
3. **Admin reviews** → marks checklist items, changes status
4. **Admin approves/rejects** → student gets email + notification
5. **On approval** → PDF approval letter auto-generated
6. **Admin generates monthly payments** → records created for approved students
7. **Admin marks payments as paid** → student gets email + notification
8. **Student downloads approval letter** from dashboard

---

## 📦 Deployment

### Production Build
```bash
# Frontend
cd frontend
npm run build
# Serve dist/ with nginx or express static

# Backend
cd backend
NODE_ENV=production node server.js
```

### MongoDB Atlas
Update `MONGODB_URI` in `.env` with your Atlas connection string.

---

## 🛡️ Security Features
- Passwords hashed with bcryptjs (12 rounds)
- JWT authentication on all protected routes
- Role-based authorization (student/admin)
- Rate limiting (100 req/15min)
- Helmet security headers
- File upload validation (type + size)
- Audit logging for all admin actions
- Input validation with express-validator
