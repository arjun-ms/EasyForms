# 📘 **EasyForms API Documentation**

Base URL: `/`

---

## 🔐 **Auth & User APIs** (`/user`)

### 1. **Sign Up**

* **POST** `/user/signup`
* **Description:** Register a new user.
* **Body:**

  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
    "role": "admin" | "user" (optional)
  }
  ```
* **Response:** `UserResponse`

---

### 2. **Login**

* **POST** `/user/login`
* **Description:** Authenticate a user and get access + refresh tokens.
* **Body (form-data):**

  * `username`: email or username
  * `password`: password
* **Response:**

  ```json
  {
    "access_token": "string",
    "refresh_token": "string",
    "token_type": "bearer"
  }
  ```

---

### 3. **Refresh Token**

* **POST** `/user/refresh`
* **Headers:**

  * `Authorization: Bearer <refresh_token>`
* **Response:** New access + refresh tokens.

---

### 4. **Get Current User Profile**

* **GET** `/user/me`
* **Headers:**

  * `Authorization: Bearer <access_token>`
* **Response:** `UserProfile`

---

### 5. **List All Users (Admin only)**

* **GET** `/user/users`
* **Headers:**

  * `Authorization: Bearer <admin_token>`
* **Response:** `List[UserResponse]`

---

## 📋 **Form Management APIs** (`/forms`)

> ⚠️ **Admin-only** access required.

### 1. **Create Form**

* **POST** `/forms/`
* **Body:** `FormCreate`
* **Response:** `FormResponse`

---

### 2. **List All Forms**

* **GET** `/forms/`
* **Response:** `List[FormResponse]`

---

### 3. **Get Specific Form**

* **GET** `/forms/{form_id}`
* **Response:** `FormResponse`

---

### 4. **Update a Form**

* **PUT** `/forms/{form_id}`
* **Body:** `FormUpdate`
* **Response:** `FormResponse`

---

### 5. **Delete Form**

* **DELETE** `/forms/{form_id}`
* **Response:** `204 No Content`

---

### 6. **Assign Form to a User**

* **POST** `/forms/{form_id}/assign`
* **Body:**

  ```json
  {
    "user_id": int
  }
  ```
* **Response:** `FormAssignmentResponse`

---

### 7. **Get Form Submissions**

* **GET** `/forms/{form_id}/submissions`
* **Response:** `List[SubmissionResponse]`

---

### 8. **Get Form Analytics**

* **GET** `/forms/{form_id}/analytics`
* **Response:**

  ```json
  {
    "form_id": int,
    "total_submissions": int,
    "field_summary": {
      "field_name": {
        "value": count | {
          "average": float,
          "min": value,
          "max": value
        }
      }
    }
  }
  ```

---

## 🙋‍♂️ **User-Assigned Form APIs** (`/user/forms`)

> For **logged-in regular users**

### 1. **List Assigned Forms**

* **GET** `/user/forms/assigned`
* **Response:** `List[FormResponse]`

---

### 2. **Get Specific Assigned Form**

* **GET** `/user/forms/{form_id}`
* **Response:** `FormResponse`

---

### 3. **Submit a Form**

* **POST** `/user/forms/{form_id}/submit`
* **Body:**

  ```json
  {
    "question1": "answer",
    "question2": "answer"
  }
  ```
* **Response:** `SubmissionResponse`

---

### 4. **List My Submissions**

* **GET** `/user/forms/`
* **Response:** `List[SubmissionResponse]`

---

## 🧪 **Utility API**

### Health Check

* **GET** `/health`
* **Response:** `{ "status": "ok" }`

---

## 🖥️ **Frontend Pages**

These are served as HTML:

| Route                           | Page                    |
| ------------------------------- | ----------------------- |
| `/`                             | Login Page              |
| `/signup`                       | Signup Page             |
| `/admin`                        | Admin Dashboard         |
| `/user`                         | User Dashboard          |
| `/form-builder`                 | Form Builder Interface  |
| `/form-submission?form_id=<id>` | Form Submission Page    |
| `/manage-users`                 | Admin User Management   |
| `/submission-history`           | User Submission History |

---

## ✅ Notes

* All protected endpoints require `Authorization: Bearer <access_token>` unless explicitly mentioned.
* Admin-only routes enforce role-based access control via dependency injection.

