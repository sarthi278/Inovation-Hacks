# 🚀 Innovation Hacks - Backend REST API & Persistent Data Layer

> **Task 2 & Task 3 Deliverable** for Innovation Hacks Full Stack Development Internship.
> A robust REST API powering User Authentication, Project Tracking, Task Management, and AI Productivity Workflows.

---

## 🏗️ Architecture & Features

- **Node.js & Express Architecture**: Clean controller-route-middleware modular separation.
- **Persistent Data Layer**: High-performance persistent storage engine with schema validation and Mongoose / MongoDB connection support.
- **Secure Authentication**: Password hashing via `bcryptjs` and stateless session verification using `jsonwebtoken` (JWT).
- **Centralized Error Handling**: Standardized error responses with appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 500).
- **AI Integration**: AI-assisted subtask breakdown, workload summarization, and project roadmap generation powered by Google Gemini API with smart heuristic engine fallback.

---

## ⚙️ Setup & Installation

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` contents:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=innovation_hacks_jwt_super_secret_key_2026
MONGODB_URI=mongodb://localhost:27017/innovation_hacks
GEMINI_API_KEY=your-gemini-api-key-here
```

### 3. Seed Initial Data
```bash
npm run seed
```

### 4. Start Server
```bash
# Start production server
npm start

# Or start with automatic reloading
npm run dev
```
The server will run at: `http://localhost:5000`

### 5. Run Automated Tests
```bash
npm test
```

---

## 📖 REST API Reference

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | ❌ No |
| `POST` | `/api/auth/login` | Login and receive JWT token | ❌ No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | ✅ Yes (Bearer Token) |

#### Register Request Body:
```json
{
  "name": "Anubhav Yadav",
  "email": "anubhav@innovationhacks.in",
  "password": "password123",
  "role": "developer"
}
```

---

### ▦ Projects (`/api/projects`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/projects` | Get all projects with progress stats | ❌ No |
| `GET` | `/api/projects/:id` | Get project by ID along with its tasks | ❌ No |
| `POST` | `/api/projects` | Create a new project | Optional / Bearer |
| `PUT` | `/api/projects/:id` | Update project details | Optional / Bearer |
| `DELETE` | `/api/projects/:id` | Delete project and cascade tasks | Optional / Bearer |

---

### ✓ Tasks (`/api/tasks`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/tasks` | Get tasks (Supports `?status=`, `?project=`, `?priority=`, `?search=`) | ❌ No |
| `GET` | `/api/tasks/stats/summary` | Get dashboard aggregate counts & velocity | ❌ No |
| `GET` | `/api/tasks/:id` | Get single task details | ❌ No |
| `POST` | `/api/tasks` | Create a new task | Optional / Bearer |
| `PATCH` | `/api/tasks/:id` | Update / Toggle status (`todo`, `in-progress`, `done`) | Optional / Bearer |
| `DELETE` | `/api/tasks/:id` | Delete a task | Optional / Bearer |

---

### 🧠 AI Productivity Capabilities (`/api/ai`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/generate-tasks` | Decompose any goal into structured actionable subtasks |
| `POST` | `/api/ai/summarize` | Executive daily workload brief, bottlenecks, and recommendations |
| `POST` | `/api/ai/project-description` | Generate project scope and milestone breakdown |

#### Sample AI Task Generation Request:
```json
{
  "prompt": "Build Stripe checkout webhook handler",
  "project": "Revenue intelligence",
  "autoInsert": false
}
```

---

## 🔒 Security & Best Practices
- Passwords are encrypted with 10 salt rounds.
- Secrets and keys are strictly managed via environment variables.
- Input fields are trimmed and sanitized.
- Cascading deletes ensure referential integrity between projects and tasks.
