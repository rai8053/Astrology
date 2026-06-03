# Deployment Guide

## Docker Compose (Recommended)

```bash
# Clone and setup
git clone <repo>
cd soma-surya

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with production values

# Deploy
docker-compose up -d

# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Seed admin user
docker-compose exec backend npx prisma db seed
```

## Vercel (Frontend Only)

1. Connect your GitHub repo to Vercel
2. Set root directory to `frontend`
3. Add environment variables:
   - `VITE_API_URL`: Your backend URL

## Railway / Render (Backend)

1. Create a new web service from your repo
2. Set root directory to `backend`
3. Build command: `npm install && npx prisma generate && npm run build`
4. Start command: `node dist/index.cjs`
5. Add environment variables from `.env.example`

## VPS Deployment

```bash
# Install dependencies
apt update && apt install -y nginx certbot nodejs npm docker docker-compose

# Clone and build
git clone <repo>
cd soma-surya
docker-compose -f docker-compose.prod.yml up -d

# Configure Nginx as reverse proxy
# (see frontend/nginx.conf for reference)

# SSL with Certbot
certbot --nginx -d somasurya.com
```

## Production Checklist

- [ ] Change JWT secrets to strong random values
- [ ] Set `NODE_ENV=production`
- [ ] Configure PostgreSQL with proper credentials
- [ ] Set up Redis for caching
- [ ] Configure Stripe webhook endpoints
- [ ] Enable rate limiting
- [ ] Set up monitoring (Sentry, PostHog)
- [ ] Configure CDN for static assets
- [ ] Set up automated backups
- [ ] Enable HTTPS with proper SSL certificates
