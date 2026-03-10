# 📸 Face Recognition Attendance Management System

A full-stack **AI-powered attendance management system** that uses **face recognition** to automatically mark student attendance through **live webcam capture or group photo processing**.

The system provides **real-time attendance tracking, automated Excel reports, and secure authentication** for teachers.

---

# 📋 System Overview

This platform integrates **modern web technologies, machine learning, and cloud databases** to automate attendance management.

Key capabilities include:

- Real-time attendance using **webcam face recognition**
- Group photo attendance processing
- Automatic **Excel attendance report generation**
- Secure **JWT-based authentication**
- Cloud storage using **MongoDB Atlas + GridFS**
- Explainable and scalable **AI recognition pipeline**

---

# 🏗️ System Architecture

## Frontend

| Technology | Version | Purpose |
|-----------|--------|--------|
| React | 18.3.1 | User Interface |
| React Router | 7.11.0 | Navigation |
| Bootstrap | 5.3.8 | UI Styling |
| Axios | 1.13.2 | API Communication |
| React Webcam | 7.2.0 | Camera Integration |
| Jest + RTL | Latest | Testing |

---

## Backend

| Technology | Purpose |
|-----------|---------|
| Flask | REST API server |
| InsightFace (ArcFace) | Face recognition |
| MongoDB Atlas | Cloud database |
| JWT | Authentication |
| GridFS | File storage |
| OpenCV | Image processing |
| NumPy | Numerical operations |
| OpenPyXL | Excel generation |

---

# 🧠 AI / ML Pipeline

The system uses **ArcFace embeddings** for accurate identity recognition.

```
Input Image
   ↓
Face Detection (InsightFace)
   ↓
Face Alignment
   ↓
Feature Extraction
   ↓
512-Dimensional Face Embedding
   ↓
Cosine Similarity Matching
   ↓
Threshold Comparison (0.38)
   ↓
Identity Match
```

---

# 🗄️ Database Design

## Student Database (`AttendanceDB`)

```json
{
  "rollNo": "24EG107B01",
  "name": "John Doe",
  "email": "john@example.com",
  "face_encoding": [512D vector],
  "model": "arcface",
  "registeredAt": "Date"
}
```

---

## Teacher Authentication Database (`TeacherAuthDB`)

```json
{
  "name": "Teacher Name",
  "email": "teacher@email.com",
  "password": "bcrypt_hash",
  "department": "CSE",
  "classes": ["AIML-B"],
  "createdAt": "Date"
}
```

---

## Attendance Reports (GridFS)

Attendance reports are stored as **Excel files** containing:

- Present students
- Absent students
- Course metadata
- Timestamp information

---

# 🔄 System Workflow

## 1️⃣ Teacher Authentication

```
Teacher Login
     ↓
JWT Token Generation
     ↓
Token Validation
     ↓
Access Protected APIs
```

---

## 2️⃣ Student Registration

```
Photo Upload
   ↓
Face Detection
   ↓
ArcFace Encoding (512D)
   ↓
MongoDB Storage
```

---

## 3️⃣ Live Attendance Workflow

```
Webcam Capture
   ↓
Capture Multiple Frames
   ↓
Face Recognition
   ↓
Present Students List
   ↓
Excel Report Generation
   ↓
GridFS Storage
   ↓
Results Display
```

---

## 4️⃣ Group Attendance Workflow

```
Upload Group Photo
   ↓
Face Detection
   ↓
Batch Recognition
   ↓
Attendance Calculation
   ↓
Excel Report Generation
   ↓
GridFS Storage
   ↓
Results Display
```

---

# 📡 API Endpoints

## Authentication

| Method | Endpoint | Description |
|------|------|------|
| POST | `/api/teacher/register` | Register teacher |
| POST | `/api/teacher/login` | Generate JWT token |

---

## Student Management

| Method | Endpoint | Description |
|------|------|------|
| POST | `/api/student/register` | Register student with face encoding |

---

## Attendance

| Method | Endpoint | Description |
|------|------|------|
| POST | `/api/attendance/live` | Live webcam attendance |
| POST | `/api/attendance/group` | Group photo attendance |
| GET | `/api/attendance/download/<filename>` | Download Excel report |
| GET | `/api/attendance/list-files` | List stored reports |

---

# 📊 Attendance Response Format

Both **live and group attendance endpoints** return a unified response format:

```json
{
  "message": "Attendance completed",
  "filename": "COA_3RD_AIML-B_2025-12-21.xlsx",
  "present": 5,
  "absent": 25,
  "present_students": [
    {
      "roll": "24EG107B01",
      "name": "John Doe",
      "time": "15:30:45"
    }
  ]
}
```

---

# 🔐 Security Features

### Authentication
- JWT token-based authentication
- Token expiration: **8 hours**
- Password hashing using **bcrypt**

### Data Security
- Separate databases for authentication and attendance
- Secure storage of face embeddings
- CORS protection enabled

---

# ⚙️ Deployment Configuration

### Environment Variables

```
MONGO_URI=mongodb+srv://.../AttendanceDB
AUTH_MONGO_URI=mongodb+srv://.../TeacherAuthDB
JWT_SECRET_KEY=your_secret_key
```

---

### Server Configuration

| Setting | Value |
|-------|------|
| Host | 0.0.0.0 |
| Port | 5050 |
| Debug | Disabled (Production) |

---

### Frontend Setup

```
npm install
npm start
```

Production build:

```
npm run build
```

---

# 📈 Performance

| Metric | Value |
|------|------|
| Face Model | ArcFace (buffalo_l) |
| Embedding Size | 512D |
| Similarity Threshold | 0.38 |
| Live Attendance Time | ~2–3 seconds |
| Group Photo Processing | ~1–2 seconds |

---

# 🚀 Key Features

- AI-powered **face recognition attendance**
- **Live webcam attendance**
- **Group photo attendance**
- Automatic **Excel report generation**
- **Cloud database storage**
- **Secure JWT authentication**
- Real-time **attendance result display**
- Timestamped attendance records

---

# 📊 System Diagrams

The project includes **Mermaid workflow diagrams** for:

- System architecture
- Data flow
- Authentication flow
- Attendance pipeline
- Deployment architecture
- User journey

These diagrams provide a **visual understanding of system operations and data movement.**

---

# 🧩 Future Improvements

- Mobile app integration
- Multi-camera classroom monitoring
- Liveness detection for anti-spoofing
- Real-time attendance analytics dashboard
- Cloud deployment with Docker & Kubernetes

---

# 👨‍💻 Author

Developed as a **full-stack AI system combining computer vision, machine learning, and modern web technologies** for intelligent attendance management.