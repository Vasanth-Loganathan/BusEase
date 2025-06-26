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
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the `Backend/` directory with the following content:

```env
PORT=5000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_database_name
DB_PORT=5432
JWT_SECRET=your_jwt_secret
```

> Replace the placeholder values with your actual PostgreSQL and JWT config.

### 4. Set up the PostgreSQL database

Create a PostgreSQL database (e.g., `busease_db`) using your preferred DB tool (like pgAdmin or terminal).

Tables will be created automatically by your application logic or via a `relational_schema.sql` file if provided.

### 5. Run the backend server

```bash
node server.js
```

The server will start at: [http://localhost:5000](http://localhost:5000)

---

## 🔑 API Overview

| Endpoint               | Method | Description                    |
|------------------------|--------|--------------------------------|
| `/api/users/register` | POST   | Register a new user            |
| `/api/users/login`    | POST   | User login                     |
| `/api/buses`          | GET    | Get list of available buses    |
| `/api/bookings`       | POST   | Book a ticket                  |
| `/api/feedback`       | POST   | Submit feedback                |
| `/api/admin/buses`    | POST   | Add a new bus (admin only)     |
| `/api/admin/bookings` | GET    | View all bookings (admin only) |

> Detailed logic is available in the `controllers/` directory.

---

## 📁 Folder Structure

```
BusEase/
├── frontend/                  # (If available)
├── Backend/
│   ├── .env
│   ├── db.js
│   ├── package.json
│   ├── server.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── bookingController.js
│   │   ├── busController.js
│   │   ├── feedbackController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── authenticateUser.js
├── structure.txt
├── relational_schema.sql
└── README.md
```

---

## 📌 Author

**Vasanth Loganathan**  
🔗 [GitHub](https://github.com/Vasanth-Loganathan) • [LinkedIn](https://linkedin.com/in/vasanthloganathan/)

---
