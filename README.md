# IdeaForge

> AI-powered crowd problem solving platform where users post real-world challenges and receive structured, ranked, and collaborative solutions.

---

## Overview

IdeaForge is a full-stack web application designed to connect people who have problems with people who have ideas, expertise, and problem-solving abilities.

The platform allows users to post real-world challenges and receive multiple community-driven solutions. Contributors can submit solutions, collaborate with others, improve existing ideas, and help surface the best solutions through voting and engagement.

Unlike traditional discussion forums, IdeaForge focuses on structured problem-solving. It is not just about asking questions or chatting. It is about collecting, evaluating, ranking, and refining ideas in a transparent and collaborative way.

The project was built as part of HackVision 2026 by Team ByteKarma.

---

## Problem Statement

Many individuals, startups, organizations, and communities face real-world challenges but often lack access to a wide range of expertise.

At the same time, many talented individuals have innovative ideas and skills but do not have a structured place to apply them.

Existing platforms such as Reddit, StackOverflow, and Upwork only solve part of the problem:

* Reddit provides discussions but lacks structure and quality control.
* StackOverflow is mostly limited to technical questions.
* Upwork focuses on paid execution rather than idea generation.

IdeaForge bridges this gap by creating a collaborative ecosystem where people can:

* Post problems
* Receive multiple solutions
* Collaborate on ideas
* Improve existing solutions
* Rank the best approaches
* Reward meaningful contributions

---

## Key Features

### 1. User Authentication

* Secure sign up and login system
* User profile creation
* Role-based experience for contributors and problem creators

### 2. Problem Posting System

Users can create structured problem statements with:

* Title
* Category
* Description
* Constraints
* Expected outcome
* Difficulty level
* Deadline
* Tags

### 3. Solution Submission

Contributors can submit detailed solutions including:

* Solution title
* Elevator pitch
* Detailed explanation
* Implementation plan
* Cost and timeline estimation

### 4. AI-Powered Problem Analyzer

The platform can analyze problem descriptions and provide:

* Suggested tags
* Difficulty estimation
* Clarity improvement tips
* Missing constraints detection

### 5. AI-Based Solution Ranking

Solutions are ranked based on:

* Feasibility
* Creativity
* Effectiveness
* Cost
* Time required
* Community engagement

### 6. Collaborative Idea Improvement

Users can improve existing solutions instead of creating duplicates.

Each improved idea creates a new tracked version so that idea evolution can be monitored over time.

### 7. Gamification System

The platform encourages participation through:

* Points
* Badges
* Leaderboards
* Contribution tracking

### 8. Dashboards

Different dashboards are available for:

* Contributors
* Problem creators
* Admins

Dashboards display:

* Problems posted
* Solutions submitted
* Votes received
* Points earned
* Rankings
* Activity history

### 9. AI Tools

Special AI features include:

* Generate Ideas
* Rank Solutions
* Match Experts
* Analyze Problems

---

## User Types

### Problem Posters

These are users who have a challenge or issue that needs a solution.

They can:

* Post problems
* Define constraints
* Set deadlines
* View submitted solutions
* Review top-ranked ideas

### Contributors

These are users who solve posted problems.

They can:

* Browse problems
* Submit solutions
* Improve existing ideas
* Earn points and badges
* Appear on leaderboards

### Hybrid Users

These are users who can both post problems and contribute solutions.

They can:

* Post challenges
* Submit solutions
* Improve ideas
* Earn points and badges
* Participate across multiple categories
* Build reputation through both posting and solving

---

## Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### AI Integration

* Claude API
* Grok API

### Deployment

* Netlify
* Render

### Version Control

* Git
* GitHub

---

## Project Structure

```bash
client/
  src/
  public/
  package.json

server/
  routes/
  middleware/
  models/
  server.js
  .env
```

---

## Installation Guide

### Clone Repository

```bash
git clone https://github.com/AlTrUiStIcPoTtErHeAd/IdeaForge.git
cd IdeaForge
```

### Run Frontend

```bash
cd client
npm install
npm run dev
```

### Run Backend

```bash
cd server
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file inside the server folder.

Example:

```env
MONGO_URI=
JWT_SECRET=
CLIENT_URL=
GROQ_API_KEY=
GROQ_MODEL=
PORT=

```

---

## Screenshots

### Landing Page

![Landing Page](./screenshots/landingPage.png)

### Sign Up Page

![Sign Up Page](./screenshots/SignUpPage.png)

### Problem Posting Page

![Problem Posting Page](./screenshots/ProblemPostingPage.png)

### Problem Details Page

![Problem Page](./screenshots/ProblemPage.png)

### Contributor Dashboard

![Contributor Dashboard](./screenshots/ContributorDashboard.png)

### Contributor Profile

![Contributor Profile](./screenshots/ContributorProfile.png)

### AI Tools Feature

![AI Tools Feature](./screenshots/AiToolsFeature.png)

---

## Future Scope

* Real-time collaboration rooms
* AI-generated solution summaries
* Expert mentorship system
* Bounty-based problems
* Multilingual support
* Advanced analytics dashboard
* Organization-specific challenge rooms
* Mobile app support

---

## Team ByteKarma

Built during HackVision 2026 by:

* Adeesh Agrawal
* Dhruvi Rawat
* Sahil Yadav
* Lavesh Gupta

---

## Final Thought

IdeaForge is not just another forum or discussion platform.

It is a structured innovation ecosystem where ideas are generated, improved, ranked, and transformed into actionable solutions.

If Upwork is where work gets done, IdeaForge is where the best way to do that work is discovered.
