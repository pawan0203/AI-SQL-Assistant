# AI–SQL Assistant

Convert natural-language questions into safe, executable PostgreSQL queries. The assistant fetches your database schema live, uses the Gemini API to generate SQL, enforces SELECT-only validation before execution, and returns results in a clean UI.

## Features

- **Natural language → SQL** — Ask questions in plain English; Gemini generates the corresponding PostgreSQL query.
- **Live schema fetching** — Reads the target Postgres database's tables, columns, and relationships at query time so generated SQL matches the real schema.
- **SELECT-only safety validation** — Every generated query is parsed and validated server-side; `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, and other mutating/DDL statements are rejected before execution.
- **Authentication** — JWT-based auth protects API routes and scopes query history per user.
- **Query history** — Past questions, generated SQL, and results are stored per user in MongoDB.

## Tech Stack

| Layer          | Technology              |
|----------------|--------------------------|
| Frontend       | React                    |
| Backend        | Node.js, Express.js      |
| App/User Data  | MongoDB                  |
| Target Database| PostgreSQL (user-connected, queried) |
| AI             | Google Gemini API        |
| Auth           | JWT                      |

## How It Works

1. User submits a natural-language question via the React frontend.
2. Backend fetches the live schema (tables, columns, types, foreign keys) from the connected PostgreSQL database.
3. The question + schema context are sent to the Gemini API, which generates a candidate SQL query.
4. The query is validated:
   - Must parse as a single statement.
   - Must be a `SELECT` (or `WITH ... SELECT`) statement only.
   - Blocklist/AST check rejects mutating keywords (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `TRUNCATE`, `GRANT`, etc.) and multi-statement injection.
5. Validated query is executed against PostgreSQL (read-only DB role recommended) and results are returned to the frontend.
6. Question, generated query, and result metadata are logged to MongoDB against the authenticated user.

## Project Structure

```
AI-SQL-Assistant/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/       # API calls (auth, query)
│   └── package.json
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── config/         # DB connections (Mongo, Postgres)
│   │   ├── controllers/
│   │   ├── middleware/     # JWT auth, error handling
│   │   ├── models/         # Mongoose models (User, QueryHistory)
│   │   ├── routes/
│   │   ├── services/       # Gemini integration, schema fetcher, SQL validator
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- PostgreSQL database to query (read-only credentials recommended)
- Gemini API key ([Google AI Studio](https://aistudio.google.com/))

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in your values:

```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000

# MongoDB (app data: users, query history)
MONGODB_URI=mongodb://localhost:27017/ai-sql-assistant

# Target PostgreSQL (schema fetching + query execution)
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=your_database
PG_USER=readonly_user
PG_PASSWORD=your_password
PG_SCHEMA=public

# Gemini API
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Query safety limits
MAX_RESULT_ROWS=100
QUERY_TIMEOUT_MS=10000
```

## Local Database Setup (Docker)

A `docker-compose.yml` at the repo root spins up PostgreSQL and MongoDB pre-configured to match `backend/.env`:

```bash
docker compose up -d
```

- **Postgres** (`localhost:5432`, db `ai_sql_assistant`, user `app_readonly`) is auto-seeded on first start from [backend/db/seed.sql](backend/db/seed.sql) with a sample `customers` / `products` / `orders` schema — enough to try questions like *"show total revenue by product category"* or *"which customers have cancelled orders"*.
- **MongoDB** (`localhost:27017`) stores app data (users, query history) with no auth for local dev.

To reset the seeded data: `docker compose down -v && docker compose up -d`.

## Getting Started

```bash
# Clone the repo
git clone <repo-url>
cd AI-SQL-Assistant

# Start local Postgres + MongoDB
docker compose up -d

# Install backend dependencies
cd backend
npm install
# .env is already provided for local dev — just add your GEMINI_API_KEY

# Install frontend dependencies
cd ../client
npm install
```

### Run in development

```bash
# Terminal 1 — backend
cd backend
npm run dev

# Terminal 2 — frontend
cd client
npm run dev
```

Frontend runs on `http://localhost:3000` (proxies `/api` to the backend), backend on `http://localhost:5000`.

## API Overview

| Method | Endpoint             | Description                          | Auth |
|--------|-----------------------|---------------------------------------|------|
| POST   | `/api/auth/register`  | Register a new user                   | No   |
| POST   | `/api/auth/login`     | Login, returns JWT                    | No   |
| GET    | `/api/schema`         | Fetch live PostgreSQL schema          | Yes  |
| POST   | `/api/query`          | Submit NL question, get SQL + results | Yes  |
| GET    | `/api/query/history`  | Get user's past queries               | Yes  |
| GET    | `/api/health`         | Health check                          | No   |

## Security Notes

- The PostgreSQL user configured for query execution **should have read-only privileges** (`SELECT` only) as a defense-in-depth measure, in addition to application-level SELECT-only validation.
- All generated SQL is validated server-side before execution — never trust or execute SQL directly from the AI response without validation.
- JWT tokens are required on all schema/query endpoints.
- Query timeouts and row-limit caps should be enforced on execution to prevent long-running or overly large queries.

## Roadmap

- [ ] Multi-schema / multi-database support
- [ ] Query explanation ("why this SQL?") alongside results
- [ ] Export results (CSV/JSON)
- [ ] Rate limiting per user

## License

hello 
MIT
