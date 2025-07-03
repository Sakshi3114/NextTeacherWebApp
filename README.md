# 📚 Teacher Schedule Check Web Application

A full-stack web application that helps **students**, **teachers**, and **admins** interact through a centralized schedule and notice management system. This app allows teachers to post notices, students to view schedules, and admins to manage teacher data efficiently.

## 🔗 Live Demo

👉 [Check it out on Vercel](https://next-teacher-web-app.vercel.app/)

---

## ✨ Features

### 👩‍🏫 Admin Panel
- Add new teacher records
- Edit existing records
- Delete teacher entries
- View individual teacher's details
- View all records at once

### 👨‍🎓 Student Panel
- Search for a teacher by **name** or **department**
- View their daily schedule and details

### 🧑‍🏫 Teacher Panel
- Register and log in
- Add lecture notices
- View all notices posted by themselves

### 📢 Notices Panel
- Left sidebar with list of teacher names (dynamic)
- Right panel displays filtered notices posted by selected teacher with **timestamp**

---

## 🛠️ Tech Stack

- **Frontend**: Next.js, Tailwind CSS, React
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Deployment**: Vercel

---

## 🧑‍💻 How to Use This Project

### 1. Clone the Repository

```bash
git clone https://github.com/Sakshi3114/NextTeacherWebApp.git
cd teacher-schedule
npm install
MONGO_URI= your_mongodb_connection_string
npm run dev

Test Credentials
➤ Admin Login
Use the following credentials to access the Admin Panel:

Role: admin
Password: admin@123

⚠️ These are dummy credentials for demo purposes only.

➤ Teacher Panel
You can register as a new teacher.

After login, you can post lecture notices.