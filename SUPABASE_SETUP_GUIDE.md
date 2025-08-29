# 🚀 AreBet Supabase Setup Guide

## Quick Setup (5 minutes)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and project name: `arebet-sports`
4. Select region closest to you
5. Set a secure database password
6. Click "Create new project"

### 2. Get Your Credentials
Once your project is ready:
1. Go to Settings → API
2. Copy your **Project URL**
3. Copy your **anon/public key**

### 3. Configure Environment
Create `.env.local` in your project root:
```env
REACT_APP_SUPABASE_URL=your_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Run Database Schema
1. Go to SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `database-schema.sql`
3. Click "Run" to execute all commands
4. Verify tables are created in Table Editor

### 5. Add Sample Data
1. In SQL Editor, run `sample-data.sql` (will be created next)
2. This adds realistic teams, leagues, and matches
3. Check Table Editor to see your data

### 6. Test Connection
```bash
npm start
```
Check browser console - should show "✅ Supabase connected successfully"

## ⚙️ Advanced Configuration

### API-Football Integration (Optional)
```env
REACT_APP_RAPIDAPI_KEY=your_rapidapi_key_here
REACT_APP_API_FOOTBALL_BASE_URL=https://api-football-v1.p.rapidapi.com/v3
```

### Real-time Features
- Real-time is enabled by default in Supabase
- Your app will automatically receive live updates
- Check Network tab for WebSocket connections

## 🔐 Security Setup

### Row Level Security (RLS)
Your schema already includes RLS policies:
- Users can only access their own profile data
- Premium features require active subscription
- API usage is tracked per user

### Environment Variables
Never commit `.env.local` - it's already in `.gitignore`

## 🚨 Troubleshooting

### Common Issues:
1. **"Invalid API key"** - Check your anon key is correct
2. **"Project not found"** - Verify your project URL
3. **Tables not created** - Run schema in SQL Editor
4. **No data showing** - Run sample data script

### Debug Mode:
Add to `.env.local`:
```env
REACT_APP_DEBUG=true
```

## 📊 Monitoring

### Check Connection Status:
- Green indicator in header = Connected
- Console shows connection logs
- Network tab shows API calls

### Database Health:
- Supabase Dashboard → Database → Health
- Monitor API usage and performance

---

Ready to proceed? Follow steps 1-6 above, then we'll add sample data and configure API integration!