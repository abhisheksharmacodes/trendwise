# TrendWise Frontend

A modern, SEO-optimized blog platform frontend built with Next.js 14+, TypeScript, and TailwindCSS.

## Features

- **Modern UI**: Clean, responsive design with TailwindCSS
- **Authentication**: Google OAuth via NextAuth.js
- **Article Management**: View articles, search, and comment
- **User Profiles**: View comment history and account info
- **Admin Dashboard**: Manage articles and trigger content generation
- **SEO Optimized**: Dynamic sitemap.xml and robots.txt
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Authentication**: NextAuth.js
- **HTTP Client**: Axios
- **State Management**: React hooks

## Getting Started

### Prerequisites

- Node.js 18+ 
- Backend API running (see backend README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp env.local.example .env.local
```

3. Configure environment variables in `.env.local`:
   - `NEXTAUTH_SECRET`: Random string for NextAuth
   - `GOOGLE_CLIENT_ID`: Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
   - `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:5000)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (NextAuth)
│   ├── article/[slug]/    # Article detail pages
│   ├── admin/             # Admin dashboard
│   ├── login/             # Login page
│   ├── profile/           # User profile
│   ├── sitemap.xml/       # Dynamic sitemap
│   ├── robots.txt/        # Robots.txt
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   ├── Navbar.tsx         # Navigation bar
│   └── Comments.tsx       # Comments component
└── types/                 # TypeScript type definitions
```

## Features

### Authentication
- Google OAuth integration
- Protected routes for admin and profile
- JWT token management

### Articles
- Article listing with search
- Article detail pages with SEO metadata
- Responsive design for all screen sizes

### Comments
- Post comments on articles (authenticated users only)
- View comment history in user profile
- Real-time comment updates

### Admin Features
- View all articles
- Trigger content bot for new trends
- Admin-only access control

### SEO
- Dynamic sitemap.xml generation
- Robots.txt configuration
- Meta tags and Open Graph tags
- Structured data for search engines

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | Yes |
| `NEXTAUTH_URL` | Your site URL | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `NEXT_PUBLIC_SITE_URL` | Frontend site URL | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
