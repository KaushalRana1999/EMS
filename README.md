# Employee Management System (MERN Stack)

A full-stack Employee Management System built with **MongoDB, Express.js, React (Vite), and Node.js**.

## Features

- **Authentication & Authorization** — JWT login/signup, bcrypt password hashing, role-based access (Admin, HR, Employee)
- **Employee Management** — Full CRUD for personal info, job details, department, and bank details
- **Department Management** — Create, update, delete departments with employee counts
- **Admin Dashboard** — Employee list, department management, promote/demote users, Recharts analytics
- **Employee Portal** — Profile view/edit, task tracking, leave application
- **HR Features** — Add employees, approve/reject leave requests, attendance/performance reports (CSV export)
- **Backend** — RESTful Express APIs, Mongoose models, Joi validation, centralized error handling, Winston/Morgan logging
- **Frontend** — React + Vite, Tailwind CSS, React Router, Context API, react-toastify, Recharts

## Project Structure

```
ems/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # Route handlers
│   ├── middleware/      # auth, error handling, Joi validation
│   ├── models/          # User, Employee, Department, Task, Leave
│   ├── routes/          # Express routers
│   ├── validators/      # Joi schemas
│   ├── seed/            # Admin + department seed script
│   ├── utils/logger.js  # Winston logger
│   └── server.js
└── frontend/
    ├── src/
    │   ├── api/          # Axios instance
    │   ├── context/      # AuthContext (Context API)
    │   ├── components/   # Shared UI + admin/hr shared widgets
    │   └── pages/         # auth/, admin/, hr/, employee/
    └── vite.config.js
```

## Prerequisites

- Node.js 18+
- A MongoDB Atlas connection string (or local MongoDB instance)

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env: set MONGO_URI, JWT_SECRET, SEED_ADMIN_* values

npm run seed     # creates the Admin account + default departments
npm run server   # starts the API on http://localhost:5000 (nodemon)
```

Default seeded admin login (override in `.env`):
```
Email:    admin@ems.com
Password: Admin@12345
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env if your backend runs on a different URL

npm run dev      # starts Vite dev server on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`, so the frontend `.env` value is optional for local dev, but required once deployed.

## Roles

| Role     | Capabilities |
|----------|--------------|
| Admin    | Full access: employees, departments, role management, tasks, leave approvals, analytics, reports |
| HR       | Add employees, approve/reject leaves, view reports, view analytics |
| Employee | View/edit own profile, manage own tasks, apply for/cancel leave |

New signups via `/signup` are always created as **Employee**. Admins can promote/demote users from **Admin → Role Management**, or set a role directly when adding an employee via the Admin/HR "Add Employee" form.

## API Overview

| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/auth/signup` | Public |
| POST | `/api/auth/login` | Public |
| GET  | `/api/auth/me` | Authenticated |
| GET/POST/PUT/DELETE | `/api/employees` | Admin/HR (view own profile: Employee) |
| GET/POST/PUT/DELETE | `/api/departments` | Admin (read: all) |
| GET/POST/PUT/DELETE | `/api/tasks` | Admin/HR assign, Employee updates own status |
| GET/POST | `/api/leaves` | Employee applies, Admin/HR view all |
| PUT | `/api/leaves/:id/review` | Admin/HR |
| GET | `/api/admin/analytics` | Admin/HR |
| GET | `/api/admin/users` | Admin |
| PUT | `/api/admin/users/:id/role` | Admin |
| PUT | `/api/admin/users/:id/status` | Admin |
| GET | `/api/admin/reports` | Admin/HR |

## Deployment

### Backend (Render / Heroku)
1. Push the `backend/` folder to a Git repo (or connect the monorepo, setting the root directory to `backend`).
2. Set environment variables from `.env.example` in the host's dashboard.
3. Build command: `npm install`. Start command: `npm start`.
4. Run `npm run seed` once (via a one-off dyno/shell) to create the admin account.

### Frontend (Vercel / Netlify)
1. Set root directory to `frontend`.
2. Build command: `npm run build`. Output directory: `dist`.
3. Set `VITE_API_URL` to your deployed backend URL, e.g. `https://your-api.onrender.com/api`.
4. Update the backend's `CLIENT_URL` env var to your deployed frontend URL (for CORS).

### Database (MongoDB Atlas)
1. Create a free cluster, a database user, and allow network access (0.0.0.0/0 for simplicity, or restrict to your host's IPs).
2. Copy the connection string into `MONGO_URI`.

## Notes

- Passwords are hashed with bcrypt (`bcryptjs`) before storage.
- JWTs are signed with `JWT_SECRET` and expire per `JWT_EXPIRES_IN` (default 7 days).
- All mutating endpoints are protected by JWT auth middleware; role-sensitive endpoints additionally use `authorize(...roles)`.
- Joi validates all major request bodies; Mongoose schema validation is a second line of defense.
- Winston logs to console + `backend/logs/`; Morgan streams HTTP request logs into Winston.
