
## 🏰 Padharo Rajasthan: Smart Tourism Management System

Padharo Rajasthan is a smart tourism management system designed to modernize ticketing, improve visitor safety, and manage crowd flow across heritage sites. The system is built using *Node.js, Express.js, and MongoDB, with **Python OpenCV* integration for real-time fraud detection and crowd analysis.

---

## 🌟 Key Features

- Virtual pass system replacing traditional paper tickets  
- Hybrid fraud detection using computer vision  
- Real-time crowd monitoring and dispersal recommendations  
- Scalable and modular RESTful backend architecture  

---

## 🛠 Tech Stack

- *Backend:* Node.js, Express.js, TypeScript  
- *Database:* MongoDB, Mongoose  
- *Computer Vision:* Python, OpenCV  
- *APIs:* Navigator Geolocation API  

---

## ⚙️ Project Setup & Execution

### 1. Prerequisites

Make sure the following are installed:

- Node.js (v18 or higher)
- npm
- MongoDB (Local or Atlas)
- Python (for OpenCV integration)

---

### 2. Environment Variables

Create a .env file in the root directory:

``env
 MONGO_URI="mongodb://localhost:27017/rajasthan-tourism"
### Add your EMAIL_SERVICE credentials here

### 3. Install & Seed Database

Install dependencies and seed the database:

npm install
npm run seed

---

### 4. Run the Application

Start the development server:

npm run dev

---

### Open your browser and visit:

http://localhost:5000/


## 📂 Project Structure

```plaintext
.
├── src/
│   ├── config/        # Database configuration
│   ├── controllers/   # Business logic
│   ├── models/        # Mongoose schemas
│   ├── routes/        # API routes
│   └── server.ts      # Application entry point
├── .env               # Environment variables
└── nf2.html         # Frontend interface
