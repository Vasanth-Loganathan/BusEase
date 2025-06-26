# 🚌 BusEase – Bus Ticket Booking and Management System

BusEase is a full-stack bus ticket booking and management system designed to streamline the process of booking seats, managing bus data, handling user feedback, and supporting admin control functionalities. The backend is built with Node.js and integrates with PostgreSQL for database operations.

---

## ⚙️ Features

- 🚌 Search and view available buses
- 🧾 Book bus tickets
- 👤 User authentication (login, signup)
- 🗣️ Submit feedback
- 🔧 Admin controls (add/edit/delete buses, view bookings)
- 🔐 JWT-based route protection

---

## 🧰 Tech Stack

- **Backend**: Node.js (Express)
- **Database**: PostgreSQL
- **Middleware**: Custom auth middleware
- **Package Manager**: npm

---

## 🔧 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Vasanth-Loganathan/BusEase.git
cd BusEase/Backend

### 2. Install dependencies

```bash
npm install

### 3.Configure environment variables

```bash
PORT=5000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_database_name
DB_PORT=5432
JWT_SECRET=your_jwt_secret

### 4. Set up the PostgreSQL database
Create a PostgreSQL database (e.g., busease_db) using your DB tool (pgAdmin, CLI, etc.)

Tables will be created automatically by your application logic or SQL schema.

### 5. Run the backend server
```bash
node server.js


The server will start at: http://localhost:5000
