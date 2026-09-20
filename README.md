# 🚀 Innovation Hacks — Full Stack Development Internship

<div align="center">

![Innovation Hacks](https://img.shields.io/badge/Innovation%20Hacks-Full%20Stack%20Internship-6366f1?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express%20REST%20API-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Database](https://img.shields.io/badge/Database-Persistent%20Layer-green?style=for-the-badge&logo=mongodb&logoColor=white)
![AI Engine](https://img.shields.io/badge/AI%20Powered-Google%20Gemini-orange?style=for-the-badge&logo=google&logoColor=white)

**"Build. Innovate. Impact."**  
*A complete, production-grade, AI-powered Developer Productivity & Task Management Platform.*

</div>

---

## 📑 Table of Contents
1. [Internship Overview & Objectives](#-internship-overview--objectives)
2. [Task-by-Task Implementation Summary](#-task-by-task-implementation-summary)
   - [Task 1: Modern Frontend Development](#task-1--modern-frontend-development)
   - [Task 2: Backend & REST API Development](#task-2--backend--rest-api-development)
   - [Task 3: Persistent Database Integration](#task-3--persistent-database-integration)
   - [Task 4: AI-Powered Full-Stack Platform](#task-4--ai-powered-full-stack-platform)
3. [System Architecture](#-system-architecture)
4. [Project Structure](#-project-structure)
5. [Quick Start & Installation](#-quick-start--installation)
6. [REST API Documentation & Endpoints](#-rest-api-documentation--endpoints)
7. [AI-Powered Capabilities](#-ai-powered-capabilities)
8. [Automated Verification & Testing](#-automated-verification--testing)
9. [LinkedIn Showcase Post Template](#-linkedin-showcase-post-template)

---

## 🔗 Live Deployment & Repository Links

- 🌐 **Live Deployed Backend API**: [https://backend-five-psi-21.vercel.app/api](https://backend-five-psi-21.vercel.app/api)
- 🏥 **Backend Health Check**: [https://backend-five-psi-21.vercel.app/api/health](https://backend-five-psi-21.vercel.app/api/health)
- 🐙 **GitHub Repository**: [https://github.com/sarthi278/Inovation-Hacks](https://github.com/sarthi278/Inovation-Hacks)

---

## 🎯 Internship Overview & Objectives

This repository contains the completed, unified implementation of the 1-Month Full Stack Development Internship program by **Innovation Hacks**. All 4 milestone tasks have been architected, coded, connected, tested, and documented end-to-end.


---

## 🏆 Task-by-Task Implementation Summary

### Task 1 — Modern Frontend Development
- **Developer Productivity Dashboard**: Built a responsive, state-driven dashboard in React.
- **Visual Design & Design System**: Modern color palettes, smooth progress indicators, project and task cards, and typography.
- **UI States**: Loading states, empty states, search filtering, and tabbed view switching.

### Task 2 — Backend & REST API Development
- **Users, Projects & Tasks REST API**: Built in Node.js & Express with clean controller-route separation.
- **Validation & Status Codes**: Strict input validation with correct, semantic HTTP status codes (`200`, `201`, `400`, `401`, `404`, `500`).
- **Centralized Error Handling**: Unified JSON error envelope `{ success: false, error: message, statusCode }`.
- **API Documentation & Postman Collection**: Full Postman JSON and README specs provided.

### Task 3 — Persistent Database Integration
- **Persistent Data Layer**: Schema validation, entity relationships, and cascading updates.
- **Relational Integrity**: Projects calculate completion percentages dynamically based on child task states; cascading deletes ensure clean data hygiene.
- **Zero-Friction Fallback Engine**: Connects seamlessly with MongoDB (`MONGODB_URI`) and automatically falls back to high-performance local persistent JSON storage for instant zero-dependency local testing.

### Task 4 — AI-Powered Full-Stack Application
- **Integrated Full-Stack Architecture**: React frontend fully communicates with Express REST backend and persistent database.
- **Authentication**: User registration, login, JWT token persistence, and profile switcher.
- **Interactive CRUD**:
  - Full Task Management (Create modal, Delete, Toggle complete, Filter by status/tag/project/priority).
  - Full Project Management (Create modal, Delete, Progress recalculation).
- **AI-Powered Capabilities**:
  1. **AI Subtask Generator**: Enter any high-level objective (e.g., *"Build Stripe webhook billing"*) and the AI generates 4 structured tasks with tags, priorities, and 1-click database insertion.
  2. **AI Daily Workload Briefing**: Analyzes active tasks, overdue items, sprint velocity, and returns actionable recommendations.
  3. **AI Project Scope Builder**: Generates milestones and descriptions.
  - Powered by **Google Gemini API** with smart heuristic AI fallback.

---

## 🏛 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 React Frontend (my-react-app)               │
│  - Productivity Dashboard      - AI Sprint Assistant Modal  │
│  - Project & Task CRUD Modals  - Auth & Profile Management  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST API (JWT)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Node.js / Express Backend (backend/)        │
│  - Auth Controller & JWT       - Centralized Error Handler  │
│  - Project & Task Controllers  - Gemini AI Engine Adapter   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Persistent Data Layer                     │
│  - MongoDB (Mongoose) + Zero-friction Local Storage Adapter │
│  - Users, Projects, and Tasks with Relational Sync          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Inovation Hacks/
├── README.md                          # Main Internship Showcase Guide
├── backend/                           # Tasks 2 & 3: REST API & Database Layer
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # DB connection & persistent engine
│   │   ├── controllers/
│   │   │   ├── authController.js     # User registration, login, me
│   │   │   ├── projectController.js  # Project CRUD & task linking
│   │   │   ├── taskController.js     # Task CRUD, filters, stats
│   │   │   └── aiController.js       # Gemini API & AI task generator
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT verification middleware
│   │   │   └── errorHandler.js       # Centralized error handler
│   │   ├── models/
│   │   │   ├── User.js               # User schema & password hashing
│   │   │   ├── Project.js            # Project schema & progress sync
│   │   │   └── Task.js               # Task schema, filters & stats
│   │   ├── routes/
│   │   │   ├── auth.routes.js        # /api/auth
│   │   │   ├── project.routes.js     # /api/projects
│   │   │   ├── task.routes.js        # /api/tasks
│   │   │   └── ai.routes.js          # /api/ai
│   │   ├── scripts/
│   │   │   ├── seed.js               # Database seeding script
│   │   │   └── test-api.js           # Automated API test suite
│   │   └── server.js                 # Express server entry point
│   ├── .env.example                  # Environment variables template
│   ├── package.json                  # Backend dependencies
│   ├── postman_collection.json       # Postman Collection
│   └── README.md                     # Backend API documentation
└── my-react-app/                      # Tasks 1 & 4: React Frontend UI
    ├── src/
    │   ├── services/
    │   │   └── api.js                # Frontend API client
    │   ├── App.js                    # Connected Dashboard & AI UI
    │   ├── App.css                   # Polished design system & styling
    │   └── index.js                  # React entry point
    └── package.json                  # Frontend dependencies
```

---

## 🚀 Quick Start & Installation

### Step 1: Start the Backend REST API
```bash
cd backend
npm install
npm run seed      # Populate initial projects and tasks
npm start         # Starts server on http://localhost:5000
```

### Step 2: Start the React Frontend
In a new terminal:
```bash
cd my-react-app
npm install
npm start         # Launches dashboard on http://localhost:3000
```

---

## 📡 REST API Documentation

- **Live Base URL**: `https://backend-five-psi-21.vercel.app/api`
- **Local Base URL**: `http://localhost:5000/api`


### 1. Authentication Endpoints
- `POST /api/auth/register` — Register a new developer account
- `POST /api/auth/login` — Log in and receive JWT token
- `GET /api/auth/me` — Get current logged-in user profile (Bearer token required)

### 2. Project Endpoints
- `GET /api/projects` — Fetch all projects with progress metrics
- `GET /api/projects/:id` — Fetch single project and its associated tasks
- `POST /api/projects` — Create a new project
- `PUT /api/projects/:id` — Update project details
- `DELETE /api/projects/:id` — Delete project & cascade delete tasks

### 3. Task Endpoints
- `GET /api/tasks` — List tasks with filters (`?status=todo`, `?priority=High`, `?search=query`)
- `GET /api/tasks/stats/summary` — Aggregate KPI stats (total, completed, in-progress, velocity)
- `POST /api/tasks` — Create a new task
- `PATCH /api/tasks/:id` — Update task status or toggle completion
- `DELETE /api/tasks/:id` — Delete a task

### 4. AI Productivity Endpoints
- `POST /api/ai/generate-tasks` — Decompose a goal into 4 actionable subtasks
- `POST /api/ai/summarize` — Generate executive sprint health and recommendations
- `POST /api/ai/project-description` — Generate AI project roadmap

---

## 🧪 Automated Verification & Testing

Run the automated backend test suite covering authentication, CRUD operations, filters, AI generators, and status codes:
```bash
cd backend
npm test
```
**Test Results**: `12/12 Passed (100% Success Rate)`.

---

## 💼 LinkedIn Showcase Post Template

Ready to post on LinkedIn to complete the internship submission requirements:

```markdown
🚀 Excited to share that I have completed the Full Stack Development Internship at Innovation Hacks! 🌟

Over the past month, I built and deployed an end-to-end, AI-Powered Developer Productivity & Task Management Platform from scratch:

🔹 Task 1: Responsive Developer Productivity Dashboard in React.js with real-time state management.
🔹 Task 2: RESTful API in Node.js & Express with JWT Authentication, centralized error handling, and semantic status codes.
🔹 Task 3: Persistent Database Layer with relational modeling, schema validation, and automatic progress tracking.
🔹 Task 4: Full-Stack Integration with Google Gemini AI capabilities for AI-assisted task breakdown and workload summarization.

A huge thank you to Innovation Hacks for this hands-on, project-based engineering experience!

🔗 GitHub Repository: [Insert your repo link]
#InnovationHacks #FullStackDevelopment #ReactJS #NodeJS #ExpressJS #MongoDB #WebDevelopment #ArtificialIntelligence #Internship
```
