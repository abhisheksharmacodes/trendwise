# TrendWise

An AI-powered blogging platform for discovering, reading, and managing trending articles with seamless user experience and robust SEO.

---

## 🚀 Features

- 🤖 **AI-Generated Content:** Automatically creates and publishes trending articles using Google Generative AI.
- 📰 **Dynamic Article Feed:** Search and explore the latest trending topics.
- 💬 **Commenting System:** Engage with articles through a built-in comment section.
- 🔒 **Secure Authentication:** User sign up, login, and admin controls with NextAuth and JWT.
- 📈 **SEO Optimized:** Server-side rendering and meta tags for high discoverability.
- 🛡️ **Robust API:** RESTful backend with rate limiting, security headers, and admin endpoints.
- 🐳 **Easy Deployment:** Docker and Docker Compose support for local and cloud deployment.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js, React, NextAuth.js, Tailwind CSS
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **Authentication:** NextAuth.js, JWT
- **AI Integration:** Google Generative AI
- **DevOps:** Docker, Docker Compose

---

## 🏁 How to Run

### 1. Clone & Install
```bash
git clone https://github.com/abhisheksharmacodes/trendwise.git
cd trendwise
```

### 2. Configure Environment

#### Backend (`back/.env`):
```env
MONGODB_URI=mongodb://localhost:27017/trendwise
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
GOOGLE_API_KEY=your_google_generative_ai_key
```

#### Frontend (`front/.env.local`):
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### 3. Start with Docker Compose
```bash
docker-compose up --build
```
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000/api](http://localhost:5000/api)
- MongoDB: `mongodb://localhost:27017/trendwise`

### 4. (Optional) Seed the Database
```bash
docker-compose exec backend node scripts/seedData.js
```

---

## 📦 Deployment

- Supports Docker and cloud platforms (e.g., Vercel, Render). Set all required environment variables in your deployment environment.
- For scheduled article generation, configure Vercel Cron or trigger `/api/cron/generate-article`.

---

> Built with [Next.js](https://nextjs.org), [Express](https://expressjs.com), and [MongoDB](https://www.mongodb.com/).
