# 📌 Leave Management System

A **comprehensive Leave Management System** built for a startup with ~50 employees. It handles employee leave applications, approvals, and balance tracking with **role-based access control**.

---

## 🏗 Tech Stack
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT  
- **Frontend:** React.js, React Router, Axios, Tailwind CSS  
- **Authentication:** JWT with bcrypt hashing  
- **Database:** MongoDB with Mongoose ODM  

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18+)  
- MongoDB (local/Atlas)  
- npm or yarn  

---

### 🔹 Backend Setup
```bash
git clone <repo-url>
cd leave-management-system/backend
```

1. Install dependencies:
```bash
npm install express mongoose cors bcryptjs jsonwebtoken dotenv nodemon
```

2. Create `.env` in backend root:
```env
PORT=8080
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRE=
NODE_ENV=
```

3. Run server:
```bash
# Dev
npm run dev
# Prod
npm start
```

---

### 🔹 Frontend Setup
```bash
cd ../frontend
```

1. Install dependencies:
```bash
npm install react react-dom react-router-dom axios
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

2. Configure `tailwind.config.js`:
```js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

3. Create `.env`:
```env
REACT_APP_API_URL=http://localhost:8080/api
```

4. Start dev server:
```bash
npm run dev
```

---

### 🔹 Database Setup
No manual setup required — MongoDB collections auto-create at runtime.

---

## 🎯 Core Assumptions
- 25 annual leave days/employee  
- Business days = Mon–Fri only  
- Leave deducted **only after approval**  
- Employees cannot apply before joining date  
- HR/Admin can approve/reject any request  
- Employees cannot self-approve  

---

## 🛡️ Edge Cases
✔ Invalid/expired JWT → auto logout  
✔ Role-based API protection  
✔ Prevent insufficient balance & overlapping requests  
✔ Block past-date & invalid ranges  
✔ Atomic approvals prevent race conditions  
✔ Real-time leave balance updates  
✔ Responsive UI, validation, and empty states  

---

## 📡 API Endpoints
### Authentication
- `POST /api/auth/register` → Register employee  
- `POST /api/auth/login` → Login employee  

### Employees
- `POST /api/employees` → Add employee (HR/Admin)  
- `GET /api/employees` → Get all employees  
- `GET /api/employees/:id/leave-balance` → Get leave balance  

### Leaves
- `POST /api/leaves` → Apply leave  
- `PATCH /api/leaves/:leaveId` → Approve/Reject leave  
- `GET /api/leaves` → Get leave requests  

---

## 🏗 High-Level Design
- **Client Layer:** React frontend (Employee/HR/Admin dashboards)  
- **API Layer:** Express.js server with middleware  
- **Business Logic Layer:** Controllers, services, validation  
- **Data Layer:** MongoDB via Mongoose models  

### Database Schemas
- **Employee:** `{ name, email, password, department, role, joiningDate, leaveBalance }`  
- **Leave:** `{ employeeId, startDate, endDate, daysRequested, reason, status, reviewedBy }`  

---

## 🚀 Roadmap
### Phase 2 (Short-term)
- Email notifications  
- Advanced reporting (PDF/Excel)  
- Calendar view & Google Calendar sync  

### Phase 3 (Mid-term)
- Multiple leave types  
- Multi-level approvals  
- Mobile app (React Native)  

### Phase 4 (Long-term)
- AI leave prediction  
- HRMS/Payroll/Slack integration  
- Microservices & scaling to 500+ employees  

---

## 🔒 Security
- JWT-based auth  
- Bcrypt password hashing  
- Role-based access control  
- Input validation & sanitization  
- CORS protection  

---

## 📊 Performance Targets
- API response: <200ms (95% requests)  
- Page load: <2s  
- DB queries: <100ms  
- 100+ concurrent users  
- 99.9% uptime  

---

## 📌 License
This project is intended for **educational and organizational use**. Add a LICENSE file as per your needs.  
