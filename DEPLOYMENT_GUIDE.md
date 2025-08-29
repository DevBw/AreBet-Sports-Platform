# 🚀 AreBet Deployment Guide

## Production Deployment Checklist

### 1. Environment Setup

**Vercel Environment Variables:**
```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
REACT_APP_RAPIDAPI_KEY=your_rapidapi_football_key

# Environment
REACT_APP_ENVIRONMENT=production
```

### 2. Database Setup

1. **Run Database Schema:**
   ```sql
   -- Execute database-schema-minimal.sql in your Supabase SQL editor
   -- Then execute database-sample-data.sql for test data
   ```

2. **Enable Row Level Security (RLS):**
   - All tables have RLS policies configured
   - Users can only access their own data
   - Premium features are gated by subscription tier

3. **Configure Supabase Edge Functions:**
   ```bash
   # Deploy API-Football integration functions
   supabase functions deploy api-football-proxy
   ```

### 3. Vercel Deployment

1. **Connect Repository:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel --prod
   ```

2. **Configure Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm ci`

3. **Set Environment Variables:**
   ```bash
   # Via Vercel CLI
   vercel env add REACT_APP_SUPABASE_URL
   vercel env add REACT_APP_SUPABASE_ANON_KEY
   vercel env add REACT_APP_RAPIDAPI_KEY
   ```

### 4. Performance Optimizations Implemented

#### Frontend Optimizations:
- ✅ **Code Splitting:** Lazy loading with React.lazy()
- ✅ **Image Optimization:** Lazy loading with intersection observer
- ✅ **Service Worker:** Caching strategy for static assets and API responses
- ✅ **Bundle Optimization:** Tree shaking and minification
- ✅ **Memory Management:** Performance monitoring utilities

#### Caching Strategy:
- **Static Assets:** 1 year cache with immutable headers
- **API Responses:** 5-minute cache with network-first strategy
- **Images:** Cache-first with fallback to network
- **HTML:** Network-first with cache fallback

#### Database Optimizations:
- **Indexes:** Applied to frequently queried columns
- **RLS Policies:** Optimized for performance
- **Connection Pooling:** Supabase handles automatically

### 5. Security Features

#### Content Security Policy:
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ HTTPS enforcement in production

#### Authentication Security:
- ✅ Supabase Auth with JWT tokens
- ✅ Row Level Security (RLS)
- ✅ Secure API key management
- ✅ CORS configuration

### 6. Monitoring & Analytics

#### Performance Monitoring:
```javascript
// Implemented in production
- Bundle size tracking
- Memory usage monitoring
- API response time tracking
- Core Web Vitals measurement
```

#### Error Tracking:
- React Error Boundaries implemented
- Console error suppression in production
- Graceful fallbacks for failed API calls

### 7. Post-Deployment Testing

#### Functionality Tests:
- [ ] User registration and login
- [ ] Subscription flow (Stripe test mode)
- [ ] Match detail pages load correctly
- [ ] Premium features are properly gated
- [ ] Real-time notifications work
- [ ] API endpoints respond correctly

#### Performance Tests:
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Service worker caching works

#### Mobile Tests:
- [ ] Responsive design on all screen sizes
- [ ] Touch interactions work properly
- [ ] Mobile navigation functions correctly
- [ ] Performance on mobile devices

### 8. Scaling Considerations

#### Current Architecture Limits:
- **Users:** ~10,000 concurrent (Supabase limit)
- **API Calls:** 1000/month per free user, unlimited for premium
- **Database:** 500MB included (Supabase free tier)
- **Bandwidth:** 1GB included (Vercel free tier)

#### Scaling Strategy:
1. **Database:** Upgrade Supabase plan for more storage/connections
2. **API:** Implement Redis caching for API responses
3. **CDN:** Vercel Edge Network handles static asset distribution
4. **Monitoring:** Add New Relic or DataDog for advanced monitoring

### 9. Backup & Recovery

#### Database Backups:
- Supabase automatic daily backups
- Point-in-time recovery available
- Export scripts for manual backups

#### Code Deployment:
- Git-based deployment with rollback capability
- Preview deployments for testing
- Atomic deployments via Vercel

### 10. Maintenance

#### Regular Tasks:
- **Weekly:** Review error logs and performance metrics
- **Monthly:** Update dependencies and security patches  
- **Quarterly:** Review and optimize database queries
- **Annually:** Security audit and penetration testing

#### API Key Rotation:
- RapidAPI keys should be rotated every 6 months
- Supabase keys rotated annually
- Environment variables updated in Vercel dashboard

---

## Quick Deploy Commands

```bash
# 1. Install dependencies
npm install

# 2. Build production bundle
npm run build

# 3. Deploy to Vercel
vercel --prod

# 4. Verify deployment
curl -I https://your-domain.vercel.app
```

## Support & Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check environment variables are set
   - Verify all dependencies are installed
   - Review build logs for specific errors

2. **Database Connection Issues:**
   - Verify Supabase URL and key
   - Check RLS policies aren't blocking requests
   - Confirm database schema is deployed

3. **API Rate Limits:**
   - Monitor RapidAPI usage
   - Implement request queuing for high traffic
   - Consider caching strategies

---

**🎉 Your AreBet application is now ready for production!**

For additional support, check the troubleshooting section or create an issue in the repository.