# 🩺 DocNest – Medical Records Management System

> A full-stack medical records management platform built as part of **Software Project Lab-2** with collaborators [@pfaaworkin01](https://github.com/pfaaworkin01) and [@saeflobor](https://github.com/saeflobor).

DocNest provides a secure, role-based solution for managing patient medical histories, digital prescriptions, and doctor-patient interactions. With features like **admin-verified doctor registration**, **file uploads via Cloudinary**, and **temporary access codes for doctors**, the system ensures privacy, accessibility, and seamless medical record management.

---

## 🚀 Features

### 🔐 Authentication & Role-Based Access

* JWT-based authentication with bcrypt password hashing.
* Three user roles: **Patient**, **Doctor**, **Admin**.
* Doctor registration requires **admin approval** with BMDC verification.
* Admin auto-generated with default credentials.

### 🛠️ Admin Doctor Verification

* Doctors apply with BMDC ID → request stored as `DoctorRequest`.
* Admin can approve (creates Doctor account) or reject (logs reason).
* Admin dashboard shows stats: total users, pending requests, and system metrics.

### 📁 Patient Medical Records Management

* Patients can add/edit/delete medical visit records.
* **Multi-tab records**: basic info, prescriptions, test reports.
* File uploads stored securely in **Cloudinary**.
* Automatic file deletion from Cloudinary on record removal.

### 🔑 Patient Access Code Sharing

* Patients generate **6-digit access codes** (valid for 30 minutes).
* Privacy controls allow hiding certain visits before sharing.
* Doctors use codes to **temporarily view patient records**.
* Audit trail logs code generation, usage, and access timestamps.

### 💊 Doctor Digital Prescriptions

* Doctors enter access codes to view patient history.
* Can create **structured digital prescriptions** (medications, dosage, advice, tests, follow-ups).
* Prescriptions are embedded into patient medical history in real time.

### 📰 Doctor Blog System

* Doctors can write blog posts for patient education.
* Public blog feed accessible to patients.
* Interactive comments between doctors and patients.
* Posts show “Verified Doctor” badge for credibility.

### 📌 Pinned Health Overview

* Patients can maintain pinned records of:

  * **Chronic conditions** (with severity levels).
  * **Current medications** (with dosage and frequency).
* Mandatory prescription images for validation.
* Color-coded severity badges for quick overview.

---

## 🏗️ Tech Stack

**Frontend**

* React (with hooks and state management)
* Components: `MedicalHistory`, `DoctorDashboard`, `AdminDashboard`, `PinnedHealthOverview`, `DigitalPrescriptionDialog`, etc.
* File upload UI integrated with Cloudinary.

**Backend**

* Node.js + Express
* MongoDB with Mongoose models (`User`, `DoctorRequest`, `MedicalHistory`, `PatientAccessCode`, `PinnedCondition`, `Medication`, `ForumPost`)
* Cloudinary for file storage
* JWT for authentication
* Role-based access middleware

---

## 📂 Project Structure

```
DocNest/
│── frontend/ (React)
│   ├── components/
│   ├── pages/
│   ├── utils/
│   └── ...
│
│── backend/ (Node.js + Express)
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── config/
│
│── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites

* Node.js & npm
* MongoDB
* Cloudinary account (for file uploads)

### Backend Setup

```bash
cd backend
npm install
# Configure environment variables
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

### Environment Variables

Create a `.env` file in `backend/` with:

```env
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🧑‍🤝‍🧑 Collaborators

* [@pfaaworkin01](https://github.com/pfaaworkin01)
* [@saeflobor](https://github.com/saeflobor)
---
