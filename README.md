Task Management API (Node.js + Express + MongoDB)
=================================================

### Overview

This is a Task Management REST API built with **Node.js**, **Express**, and **MongoDB**.  
Users can **register**, **login**, and manage **tasks** with **priority**, **status**, filtering, sorting, and pagination.

Authentication is handled via **JWT**, and tasks are always scoped to the logged-in user.

---

## Environment Variables

Create a `.env` file in the project root (or `.env.local` if you prefer) with:

```bash
PORT=3000
MONGO_URI=mongodb://localhost:27017/taskdb
JWT_SECRET=changeme-secret
```

---

## Running Locally (without Docker)

1. **Install dependencies**

```bash
cd kumudu-task-management-api
Public
npm install
```

2. **Start MongoDB locally**

- Ensure MongoDB is running on `mongodb://localhost:27017` (adjust `MONGO_URI` if needed).

3. **Run the server**

```bash
npm run dev
# or
npm start
```

4. **Health check**

```bash
curl http://localhost:3000/api/health
```

---

## Running with Docker

### Build and run using Docker Compose

From the project root:

```bash
cd /home/raj/Documents/task/Kumudu
docker-compose up --build
```

This will:

- Start a MongoDB container (`mongo`)
- Build and start the backend container (`backend`) on port `3000`

### Access the API

```bash
curl http://localhost:3000/api/health
```

To stop:

```bash
docker-compose down
```

---

## API Endpoints & cURL Examples

Base URL (local/Docker): `http://localhost:3000`

### Authentication

- **Register** – `POST /api/users/register`

```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

- **Login** – `POST /api/users/login`

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

The login response includes a `token`. Use this token in the `Authorization` header as `Bearer <token>` for all task routes.

---

### Tasks (Protected – requires `Authorization: Bearer <token>`)

- **Create Task** – `POST /api/tasks`

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "title": "Finish assignment",
    "description": "Node.js backend test",
    "priority": "High",
    "status": "Pending"
  }'
```

- **Get All Tasks (with filtering, sorting, pagination)** – `GET /api/tasks`

Query parameters:

- `status` – `Pending | In Progress | Done`
- `priority` – `Low | Medium | High`
- `sortBy` – `createdAt | priority`
- `sortOrder` – `asc | desc`
- `page` – page number (default `1`)
- `limit` – page size (default `10`)

```bash
curl -X GET "http://localhost:3000/api/tasks?status=Pending&priority=High&sortBy=createdAt&sortOrder=desc&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

- **Get Single Task** – `GET /api/tasks/:id`

```bash
curl -X GET http://localhost:3000/api/tasks/TASK_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

- **Update Task** – `PUT /api/tasks/:id`

```bash
curl -X PUT http://localhost:3000/api/tasks/TASK_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "title": "Finish assignment (updated)",
    "description": "Updated description",
    "priority": "Medium",
    "status": "In Progress"
  }'
```

- **Delete Task** – `DELETE /api/tasks/:id`

```bash
curl -X DELETE http://localhost:3000/api/tasks/TASK_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## Running Tests

This project uses **Jest** and **Supertest** (with an in-memory MongoDB for integration tests).

- **Test command**

```bash
npm test
```

- **What the tests cover**
  - `tests/health.test.js` – verifies `GET /api/health` returns a 200 with `{ message: "Server is running!" }`.
  - `tests/authTasksFlow.test.js` – full flow:
    - `POST /api/users/register` – register a user  
    - `POST /api/users/login` – login and get JWT  
    - `POST /api/tasks` – create a task  
    - `GET /api/tasks` – list tasks  
    - `PUT /api/tasks/:id` – update a task  
    - `DELETE /api/tasks/:id` – delete a task  

These tests use an in-memory MongoDB instance (via `mongodb-memory-server`), so they do **not** touch your local or Docker database.

---

## Deployment Notes

- Set the following environment variables on your cloud platform:
  - **`PORT`** – e.g. `3000`
  - **`MONGO_URI`** – your cloud MongoDB connection string (e.g. Atlas)
  - **`JWT_SECRET`** – a strong secret value
- Ensure inbound HTTP traffic is allowed on the configured `PORT`.


