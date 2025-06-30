# TrendWise Backend

A Node.js backend for the TrendWise SEO-optimized blog platform, featuring AI-powered content generation using Google Gemini.

## Features

- **AI Content Generation**: Google Gemini integration for SEO-optimized articles
- **Trending Topics**: Fetch trending topics from Google Trends and Twitter
- **User Authentication**: JWT-based authentication with Google OAuth
- **Article Management**: CRUD operations for articles with SEO optimization
- **Comment System**: User comments with moderation capabilities
- **Admin Dashboard**: Content generation and article management
- **SEO Tools**: Automatic SEO scoring and optimization

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **AI**: Google Gemini API
- **Authentication**: JWT + Google OAuth
- **Web Scraping**: Puppeteer + Cheerio
- **Security**: Helmet, CORS, Rate Limiting

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API key
- Google OAuth credentials

### Installation

1. Install dependencies:
```bash
cd back
npm install
```

2. Copy environment variables:
```bash
cp env.example .env
```

3. Configure environment variables in `.env`:
   - `MONGODB_URI`: MongoDB connection string
   - `GEMINI_API_KEY`: Google Gemini API key
   - `JWT_SECRET`: Random string for JWT signing
   - `GOOGLE_CLIENT_ID`: Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
   - `FRONTEND_URL`: Frontend URL for CORS

4. Start the development server:
```bash
npm run dev
```

5. The API will be available at `https://trendwise-app-back.vercel.app`

## API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user info

### Articles
- `GET /api/articles` - List articles (with search & pagination)
- `GET /api/articles/:slug` - Get article by slug
- `POST /api/articles` - Create article (admin only)
- `PUT /api/articles/:slug` - Update article (admin only)
- `DELETE /api/articles/:slug` - Delete article (admin only)

### Comments
- `GET /api/comments/:articleId` - Get comments for article
- `POST /api/comments/:articleId` - Post comment (auth required)
- `GET /api/comments/user/history` - Get user's comment history

### Admin
- `GET /api/admin/articles` - List all articles (admin only)
- `POST /api/admin/generate-article` - Generate article from topic
- `POST /api/admin/generate-from-trends` - Generate articles from trends

### Trends
- `GET /api/trends` - Get trending topics

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment (development/production) | No |

## Content Generation

The backend uses Google Gemini to generate SEO-optimized articles:

### Features
- **SEO Optimization**: Automatic meta tags, keywords, and descriptions
- **Content Structure**: Proper H1-H3 headings and formatting
- **Media Suggestions**: Images, videos, and social media content
- **SEO Scoring**: Automatic SEO quality assessment
- **Read Time**: Estimated reading time calculation

### Generation Process
1. Fetch trending topics from Google Trends/Twitter
2. Search for related content for context
3. Generate article using Gemini with SEO prompts
4. Parse and structure the generated content
5. Calculate SEO score and metadata
6. Save to database with proper formatting

## Database Models

### Article
- Title, slug, content, excerpt
- SEO metadata (title, description, keywords)
- Media (images, videos, tweets)
- Trending topic and source
- SEO score and read time
- View count and timestamps

### User
- Google OAuth integration
- Role-based access (user/admin)
- Comment history and preferences
- Activity tracking

### Comment
- Article association
- User information
- Content and moderation status
- Likes and replies

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: API request throttling
- **CORS Protection**: Cross-origin request control
- **Input Validation**: Request data sanitization
- **Helmet**: Security headers
- **Admin Protection**: Role-based access control

## Deployment

### Heroku
1. Create Heroku app
2. Set environment variables
3. Deploy with Git

### Render
1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically

### Railway
1. Import from GitHub
2. Set environment variables
3. Deploy with automatic scaling

## Development

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests (placeholder)

### Project Structure
```
back/
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic
├── middleware/      # Express middleware
├── server.js        # Main server file
└── package.json     # Dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 