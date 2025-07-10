# 📝 Dynamic Form Platform

A lightweight form management system built using **FastAPI** (backend) and **HTML/CSS/JS** (frontend) that enables:

- Admins to create, update, assign, and analyze dynamic forms
- Users to view assigned forms, submit responses, and track submissions

---

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based login and refresh token system
- Role-based access control (`admin` / `user`)
- Secure password hashing

### 📄 Form Management (Admin)
- Create, update, delete dynamic forms
- Assign forms to users
- View all forms and their assigned users

### 🧑‍💼 User Experience
- View forms assigned to them
- Dynamically render input fields from JSON schema
- Submit responses with validation
- View submission history

### 📊 Analytics (Admin)
- View all submissions for a specific form
- **[Planned]** Field-wise breakdown with counts/averages

---

## 🧱 Tech Stack

| Layer       | Tech                   |
|-------------|------------------------|
| Backend     | FastAPI, SQLAlchemy    |
| Frontend    | HTML, CSS, JS          |
| Database    | PostgreSQL             |
| Auth        | JWT (access + refresh) |
| Schema      | Pydantic               |

---

## 🛠️ Setup Instructions

### 1. Clone & Install
```bash
git clone https://github.com/your-username/dynamic-form-platform.git
cd dynamic-form-platform
pip install -r requirements.txt
```

### 2. Set Environment Variables
Create a `.env` file or set manually:
```env
DATABASE_URL=sqlite:///./form.db
JWT_SECRET_KEY=your_secret_key
```

### 3. Run the Server
```bash
uvicorn backend.main:app --reload
```

### 4. Access the App
- Backend: `http://127.0.0.1:8000`
- Swagger UI: `http://127.0.0.1:8000/docs`
- Frontend: Open `index.html`, `user-dashboard.html`, etc., in a browser

---

## 📌 Project Progress

### ✅ Core Functionalities

- [x] Auth (register, login, refresh)
- [x] Admin Form Management
- [x] Form assignment & retrieval
- [x] User form submission
- [x] Submission history
- [x] Basic analytics (submissions per form)

### 🔄 In Progress
- [ ] Admin: Analytics summary (`/forms/{id}/analytics`)
- [ ] Frontend: Dynamic charts or CSV export
- [ ] Unit tests & Swagger docs

---
```
.
├── main.py
├── database.py
├── models.py
├── schemas.py
├── routers/
│   ├── user.py
│   ├── forms.py
│   ├── user_forms.py
│   └── submissions.py
├── static/
│   └── js/
│       ├── login.js
│       ├── form-builder.js
│       ├── fetch-forms.js
│       └── form-submission.js
├── templates/
│   └── *.html
```

---

## ✅ Success Criteria

- [x] Admin can manage and assign forms easily
- [x] Role-based access is enforced
- [x] Forms render dynamically using schema
- [x] Submissions are tracked per user
- [x] Clean code structure

---

## 📌 Contributors

- **Arjun M S** – Developer
  [SnapCV](https://arjun-ms.snapcv.me/)

---

## 📜 License

MIT License – use freely, credit appreciated.
