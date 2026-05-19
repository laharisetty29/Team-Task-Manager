# Team Task Manager - Full Stack Web Application

A full-stack Team Task Manager web application where users can create projects, assign tasks, and track project progress with role-based access control for Admin and Member users.

---

# Features

## Authentication
- User Signup
- User Login
- JWT Authentication
- Secure Password Hashing using bcrypt

## Role-Based Access Control

### Admin
- Create Projects
- Create Tasks
- Assign Tasks to Members
- View All Tasks
- Monitor Dashboard Statistics

### Member
- View Assigned Tasks
- Update Task Status
- Track Personal Task Progress

## Project Management
- Create and Manage Projects
- Assign Team Members
- Track Project Tasks

## Task Management
- Create Tasks
- Assign Tasks
- Update Task Status
- Due Date Tracking
- Overdue Task Detection

## Dashboard
- Total Tasks
- Pending Tasks
- In Progress Tasks
- Completed Tasks
- Overdue Tasks

---

# Tech Stack

## Frontend
- React.js
- Vite
- Axios
- CSS

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt.js

---

# Folder Structure

```
team-task-manager/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   └── tasks.js
│   ├── .env
│   ├── server.js
│   └── package.json
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── api/
    │   │   └── axios.js
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── TaskCard.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Projects.jsx
    │   │   ├── ProjectDetail.jsx
    │   │   └── Tasks.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env
    └── package.json
```
---
## Installation and Setup
# Clone Repository

```bash
git clone https://github.com/your-username/team-task-manager-fullstack.git
cd team-task-manager
```
## Backend Setup
# Navigate to backend folder
```bash
cd backend
```
# Install Dependencies
```bash
npm install
```
# Create .env file
```bash
PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```
# Start Backend Server
```bash
npm run dev
```
# Backend runs on:
```bash
http://localhost:5000
```
---
## Frontend Setup
# Navigate to frontend folder
```bash
cd frontend
```
# Install Dependencies
```bash
npm install
```
# Create .env file
```bash
VITE_API_URL=http://localhost:5000/api
```
# Start Frontend
```bash
npm run dev
```
# Frontend runs on:
```bash
http://localhost:5173
```
---
# Future Enhancements
```txt
-Team Chat System
-Notifications
-File Uploads
-Activity Logs
-Email Alerts
-Drag and Drop Task Board
```
## Author
Gadamsetty Lahari

## License
This project is developed for educational and assignment purposes.
