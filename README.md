# Employee Leave Management System

A MERN stack web application that simplifies employee leave requests and approvals. It supports secure login, role-based access, and leave status tracking for employees and managers.


## Tech Stack

- Frontend : React.js  
- Backend : Node.js + Express.js  
- Database : MongoDB  
- Authentication : JWT (JSON Web Token)  
- Security : bcrypt for password hashing


## Features

- User registration and login  
- Role-based access (Employee & Manager)  
- Apply for leave with reason and date  
- View leave request status (Pending / Approved / Rejected)  
- Manager dashboard to approve/reject requests  
- Leave summary and history tracking


## How to Run

```bash
# Clone the repository
git clone https://github.com/your-username/employee-leave-management.git

# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install

# Run the backend
npm start

# Run the frontend
cd ../client
npm start
