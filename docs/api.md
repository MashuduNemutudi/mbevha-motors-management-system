# MMMS — API Documentation

Base URL (development): `http://localhost:5000/api`
Base URL (production):  `https://your-api.onrender.com/api`

All JSON responses follow this shape:
```json
{
  "success": true | false,
  "message": "Human-readable description",
  "data": { } | [ ]
}
```

Protected routes require: `Authorization: Bearer <token>`

---

## Auth

| Method | Endpoint        | Auth | Description               |
|--------|-----------------|------|---------------------------|
| POST   | /auth/login     | No   | Login and receive JWT     |
| GET    | /auth/me        | Yes  | Get current admin profile |

### POST /auth/login
**Body:** `{ "username": "string", "password": "string" }`
**Response:** `{ token, admin: { id, username } }`

---

## Business Info

| Method | Endpoint   | Auth | Description              |
|--------|------------|------|--------------------------|
| GET    | /business  | No   | Get business information |
| PUT    | /business  | Yes  | Update business info     |

---

## Messages (Contact Form)

| Method | Endpoint            | Auth | Description         |
|--------|---------------------|------|---------------------|
| POST   | /messages           | No   | Submit contact form |
| GET    | /messages           | Yes  | List all messages   |
| PATCH  | /messages/:id/read  | Yes  | Mark message as read|
| DELETE | /messages/:id       | Yes  | Delete message      |

**POST /messages Body:**
```json
{
  "name": "string (required)",
  "phone": "string (required)",
  "vehicle": "string (optional)",
  "message": "string (required)"
}
```

---

## Parts

| Method | Endpoint    | Auth | Description                  |
|--------|-------------|------|------------------------------|
| GET    | /parts      | No   | List available parts (public)|
| GET    | /parts/:id  | No   | Get single part              |
| POST   | /parts      | Yes  | Add part with image upload   |
| PUT    | /parts/:id  | Yes  | Update part                  |
| DELETE | /parts/:id  | Yes  | Delete part                  |

**POST /parts:** `multipart/form-data`  
Fields: `name, category, description, price, quantity, is_available, image`

---

## Gallery

| Method | Endpoint      | Auth | Description           |
|--------|---------------|------|-----------------------|
| GET    | /gallery      | No   | List all images       |
| POST   | /gallery      | Yes  | Upload image          |
| PATCH  | /gallery/:id  | Yes  | Update caption        |
| DELETE | /gallery/:id  | Yes  | Delete image and file |

---

## Quotations

| Method | Endpoint              | Auth | Description           |
|--------|-----------------------|------|-----------------------|
| GET    | /quotations           | Yes  | List quotations       |
| GET    | /quotations/:id       | Yes  | Get quotation + items |
| POST   | /quotations           | Yes  | Create quotation      |
| PUT    | /quotations/:id       | Yes  | Update quotation      |
| DELETE | /quotations/:id       | Yes  | Delete quotation      |
| GET    | /quotations/:id/pdf   | Yes  | Generate PDF          |

---

## Invoices

| Method | Endpoint              | Auth | Description           |
|--------|-----------------------|------|-----------------------|
| GET    | /invoices             | Yes  | List invoices         |
| GET    | /invoices/:id         | Yes  | Get invoice + items   |
| POST   | /invoices             | Yes  | Create invoice        |
| PUT    | /invoices/:id         | Yes  | Update invoice        |
| DELETE | /invoices/:id         | Yes  | Delete invoice        |
| PATCH  | /invoices/:id/pay     | Yes  | Mark as paid          |
| GET    | /invoices/:id/pdf     | Yes  | Generate PDF          |

---

## HTTP Status Codes Used

| Code | Meaning                     |
|------|-----------------------------|
| 200  | OK                          |
| 201  | Created                     |
| 400  | Bad Request (validation)    |
| 401  | Unauthorised (no/bad token) |
| 404  | Not Found                   |
| 429  | Too Many Requests           |
| 500  | Internal Server Error       |
