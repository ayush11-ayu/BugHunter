# BugHunter

AI-Powered Bug and Issue Management Platform

BugHunter is a full-stack bug management system designed to help software teams report, track, assign, analyze, and resolve software bugs. It combines traditional bug tracking with an AI service for bug classification, priority and severity recommendations, summaries, possible causes, suggested fixes, and duplicate bug detection.

## Features

### Bug Management
- Create bugs
- View bug details
- Update bug status
- Update priority and severity
- Assign bugs to developers
- Search bugs
- Filter bugs by status, priority, and severity
- Track bug activity history

### Authentication and Authorization
- User registration
- User login
- JWT authentication
- Protected routes
- Role-based authorization
- Admin, Manager, Developer, and Tester roles

### Comments
- Add comments to bugs
- View bug comments
- Delete comments
- Track comment activity

### Dashboard
- Total bugs
- Open bugs
- In-progress bugs
- Resolved bugs
- Closed bugs
- Reopened bugs
- Total projects
- Bug status statistics
- Bug priority statistics
- Project health

### AI Features
- Automatic bug category detection
- Priority recommendation
- Severity recommendation
- Bug summary
- Possible cause
- Suggested fix
- AI confidence score
- Duplicate bug detection
- Similarity matching

## Technology Stack

### Frontend
- React
- Vite
- React Router
- Axios
- Recharts
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

### AI Service
- Python
- FastAPI
- HTTPX
- Rule-based AI analysis

### Testing
- Jest
- Supertest

## Architecture

```text
React Frontend
      |
      v
Node.js + Express API
      |
      +------> MongoDB
      |
      v
Python FastAPI AI Service
      |
      v
AI Analysis
