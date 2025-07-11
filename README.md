# TrendWise

TrendWise is an SEO-optimized blog platform that automatically generates trending articles using AI for new trends, supports user authentication, comments, and provides a modern Next.js frontend. The backend is built with Node.js, Express, and MongoDB.

---

## Features

### Backend
- RESTful API for articles, comments, users, and trends
- Automatic trending article generation using AI (Google Generative AI)
- MongoDB database with Mongoose models
- JWT-based authentication and admin roles
- Rate limiting, security headers, and CORS
- Scheduled article generation (Vercel Cron or manual trigger)
- Database seeding script

### Frontend
- Modern Next.js 15 app with React 19
- User authentication (NextAuth.js)
- Article listing, search, and detail pages
- Commenting system
- Responsive, SEO-friendly UI
- Profile and login pages

---

## Project Structure

```
trendwise/
  back/        # Backend (Node.js, Express, MongoDB)
  front/       # Frontend (Next.js, React)
  Dockerfile.backend
  Dockerfile.frontend
  docker-compose.yml
  README.md
```

---

## Setup Instructions

### Prerequisites
- [Node.js 18+](https://nodejs.org/)
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

### 1. Clone the Repository
```sh
git clone <your-repo-url>
cd trendwise
```

### 2. Environment Variables

#### Backend (`back/.env`)
```
MONGODB_URI=mongodb://localhost:27017/trendwise
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
GOOGLE_API_KEY=your_google_generative_ai_key
```

#### Frontend (`front/.env.local`)
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

---

## Running Locally (Without Docker)

### Backend
```sh
cd back
npm install
npm start
```

### Frontend
```sh
cd front
npm install
npm run dev
```

---

## Running with Docker & Docker Compose

1. Build and start all services:
   ```sh
   docker-compose up --build
   ```
2. The frontend will be available at [http://localhost:3000](http://localhost:3000)
3. The backend API will be at [http://localhost:5000/api](http://localhost:5000/api)
4. MongoDB will be running at `mongodb://localhost:27017/trendwise`

---

## Seeding the Database

To seed the database with sample articles and users:
```sh
# If running locally
cd back
node scripts/seedData.js

# If using Docker Compose (in another terminal)
docker-compose exec backend node scripts/seedData.js
```

---

## API Overview

- `GET /api/articles` — List articles (search & pagination)
- `GET /api/articles/:slug` — Get article by slug
- `POST /api/articles` — Create article (admin)
- `PUT /api/articles/:slug` — Update article (admin)
- `DELETE /api/articles/:slug` — Delete article (admin)
- `POST /api/cron/generate-article` — Trigger AI article generation (for Vercel Cron)
- Auth, comments, and trends endpoints also available

---

## Main UI Features
- Home page with trending articles
- Article detail pages with comments
- User login and profile
- Responsive navbar
- SEO meta tags and Open Graph support

---

## Notes
- For production, set strong secrets and use secure environment variable management.
- You can configure Vercel Cron to hit the backend `/api/cron/generate-article` endpoint for scheduled article generation.
- MongoDB data is persisted in a Docker volume (`mongo-data`).

---

## License
MIT 