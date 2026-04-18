# IdeaForge — Crowd-Powered Problem Solving Platform

A full-stack web application where individuals and organizations post real-world problems and receive AI-ranked solutions from a diverse contributor community.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| AI | Anthropic Claude API |
| Realtime | Socket.io |
| Auth | JWT (jsonwebtoken + bcryptjs) |

---

## Project Structure

```
ideaforge/
├── server/
│   ├── models/
│   │   ├── User.js          # User schema with points, badges, levels
│   │   ├── Problem.js       # Problem schema with AI analysis field
│   │   └── Solution.js      # Solution schema with AI evaluation + version history
│   ├── routes/
│   │   ├── auth.js          # Register, login, /me
│   │   ├── problems.js      # CRUD + vote
│   │   ├── solutions.js     # Submit, edit, vote, comment, mark-winner
│   │   ├── ai.js            # All 6 AI endpoints
│   │   └── users.js         # Leaderboard, profile, dashboard
│   ├── middleware/
│   │   └── auth.js          # JWT middleware
│   ├── server.js            # Express + Socket.io entry
│   └── .env.example
│
└── client/
    └── src/
        ├── pages/
        │   ├── Home.jsx         # Problem feed with search + filters
        │   ├── ProblemDetail.jsx # Full problem + solutions + AI tools
        │   ├── PostProblem.jsx  # Post form + AI analyzer
        │   ├── Dashboard.jsx    # User dashboard + leaderboard
        │   ├── AIHub.jsx        # 4 standalone AI tools
        │   ├── Profile.jsx      # User profile page
        │   ├── Login.jsx
        │   └── Register.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ProblemCard.jsx
        │   ├── SolutionCard.jsx  # With version history, AI scores, comments
        │   └── AIPanel.jsx       # Reusable AI panel components
        ├── context/
        │   └── AuthContext.jsx   # Global auth state
        └── api/
            └── index.js          # Axios instance
```

---

## Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Anthropic API key

---

### 1. Clone & Install

```bash
# Backend
cd server
npm install
cp .env.example .env
# Fill in your MONGO_URI, JWT_SECRET, ANTHROPIC_API_KEY

# Frontend
cd ../client
npm install
```

---

### 2. Configure Environment (server/.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ideaforge
JWT_SECRET=your_super_secret_jwt_key_change_this
ANTHROPIC_API_KEY=your_anthropic_api_key_here
CLIENT_URL=http://localhost:5173
```

---

### 3. Run the App

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Visit **http://localhost:5173**

---

## AI Features

| Feature | Endpoint | Description |
|---------|----------|-------------|
| Problem Analyzer | `POST /api/ai/analyze-problem` | Clarity score, difficulty, tags, constraints |
| Generate Ideas | `POST /api/ai/generate-ideas` | 3 creative solution ideas |
| Rank Solutions | `POST /api/ai/rank-solutions` | Score all solutions 1-10 |
| Evaluate Solution | `POST /api/ai/evaluate-solution` | Feasibility/creativity/effectiveness scores |
| Boost Idea | `POST /api/ai/boost-idea` | Expand rough idea into full solution |
| Match Experts | `POST /api/ai/match-experts` | Identify ideal expert profiles |

---

## Gamification

| Action | Points |
|--------|--------|
| Post a problem | +50 |
| Submit a solution | +100 |
| Get your solution upvoted | +10 |
| Win a challenge | +500 |
| Level up | Every 1000 XP |

**Badges:** Welcome, First Solver, Innovator (10 solutions), Problem Solver (win)

---

## Key Features

- **Real-time updates** via Socket.io — new solutions notify the problem poster instantly
- **Solution version history** — every edit tracked
- **AI ranking** — all solutions scored and re-ordered by Claude
- **Collaborative comments** on solutions
- **Winner selection** by problem poster → marks problem solved, rewards contributor
- **Leaderboard** with points, levels, badges
- **Responsive** — works on mobile and desktop
