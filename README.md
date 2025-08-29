# ⚽ AreBet Sports Platform

A modern, real-time sports betting platform built with React and Supabase, providing comprehensive football data, analytics, and betting insights.

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
![Supabase](https://img.shields.io/badge/Supabase-Backend-00D4AA?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🏆 **Core Features**
- **Live Match Tracking**: Real-time scores and match updates
- **Comprehensive League Data**: Support for 31+ major football leagues
- **Team & Player Analytics**: Detailed statistics and performance metrics
- **Match Predictions**: AI-powered betting predictions and insights
- **Odds Comparison**: Multi-bookmaker odds tracking and analysis
- **Transfer Market**: Latest player transfers and market activity
- **Injury Reports**: Current player injury status and updates
- **Venue Information**: Stadium details and match locations

### 🎨 **Modern Design**
- **React 18**: Latest React features with concurrent rendering
- **Glassmorphism UI**: Modern design with backdrop blur effects
- **Responsive Layout**: Mobile-first design that works on all devices
- **Dark Theme**: Professional dark theme with accent colors
- **Smooth Animations**: CSS transitions and micro-interactions
- **Accessibility**: WCAG 2.1 compliant interface

### 🔧 **Technical Features**
- **Supabase Backend**: PostgreSQL database with real-time capabilities
- **31+ API Endpoints**: Complete sports data coverage
- **Real-time Updates**: Live data synchronization
- **Advanced Caching**: 5-minute intelligent caching system
- **Error Boundaries**: Graceful error handling and recovery
- **Performance Optimized**: Lazy loading and code splitting

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Supabase account
- API-Football key (optional, for data sync)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/arebet-sports-platform.git
   cd arebet-sports-platform
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Supabase**:
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Run the SQL schema from `supabase_schema.sql`
   - Run the constraints fix from `fix_constraints.sql`

4. **Environment Setup**:
   Create a `.env.local` file:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start development server**:
   ```bash
   npm start
   ```

6. **Open your browser** to [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

The application uses a comprehensive PostgreSQL schema with tables for:

- **leagues** - Competition information and metadata
- **teams** - Team details, venues, and statistics  
- **players** - Player profiles and career information
- **fixtures** - Match schedules, results, and live data
- **standings** - League table positions and points
- **player_statistics** - Individual player performance data
- **predictions** - AI betting predictions and analysis
- **odds** - Multi-bookmaker betting odds
- **venues** - Stadium information and capacity
- **injuries** - Player injury reports and status
- **transfers** - Transfer market data and history
- **countries** - Country and flag information

## 🔄 API Endpoints (31+ Available)

### Core Data
- `getFixtures()` - Match fixtures and results
- `getLiveFixtures()` - Real-time live matches
- `getStandings()` - League tables and standings
- `getTeams()` - Team information and statistics
- `getLeagues()` - Competition data

### Player & Statistics
- `getPlayers()` - Player search and information
- `getSquads()` - Team squads and rosters
- `getTopScorers()` - Leading goal scorers
- `getTopAssists()` - Top assist providers
- `getTopYellowCards()` - Disciplinary statistics
- `getTopRedCards()` - Red card statistics

### Match Details
- `getFixtureEvents()` - Match events and timeline
- `getFixtureLineups()` - Team lineups and formations
- `getFixtureStatistics()` - Match statistics and data
- `getHeadToHead()` - Historical match records

### Predictions & Betting
- `getPredictions()` - AI match predictions
- `getOdds()` - Betting odds comparison
- `getBookmakers()` - Available bookmakers

### Additional Data
- `getInjuries()` - Player injury reports
- `getTransfers()` - Transfer market activity
- `getVenues()` - Stadium information
- `getCoaches()` - Coach profiles
- `getCountries()` - Country data
- `getSeasons()` - Available seasons

## 📁 Project Structure

```
src/
├── features/              # Feature-based modules
│   ├── dashboard/        # Main dashboard with insights
│   ├── matches/          # Fixtures and live matches
│   ├── standings/        # League tables
│   ├── teams/            # Team profiles and stats
│   ├── match-detail/     # Detailed match analysis
│   └── statistics/       # Analytics and reports
├── shared/               # Shared components and utilities
│   ├── components/       # Reusable UI components
│   ├── services/         # Supabase service layer
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── constants/       # App constants
│   └── context/         # React context providers
└── styles/              # Global styles and themes
```

## 🛠️ Available Scripts

### Development
```bash
npm start                 # Start development server
npm run build            # Build for production
npm test                 # Run test suite
npm run lint             # Lint code
```

### Database Management
```bash
# Run in Supabase SQL Editor:
# - supabase_schema.sql (initial schema)
# - fix_constraints.sql (constraint fixes)
```

## 🔒 Security Features

- **Row Level Security (RLS)** on all Supabase tables
- **Environment variable protection** for sensitive data
- **API rate limiting** and request throttling
- **Input validation** and sanitization
- **Error boundary protection** against crashes
- **Secure authentication** ready for user accounts

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
3. Deploy automatically on push to main branch

### Netlify
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variables

## 📱 Real-time Features

- **Live Match Updates**: Scores and status changes
- **Real-time Odds**: Betting odds fluctuations  
- **Instant Sync**: Data synchronization across clients
- **WebSocket Support**: Via Supabase real-time subscriptions
- **Push Notifications**: Match alerts and updates

## 🎨 Design System

### Modern Glassmorphism UI
- **Glass Effects**: Translucent backgrounds with blur
- **Dark Theme**: Professional dark color scheme
- **Accent Colors**: Vibrant green highlights (#00ff88)
- **Smooth Animations**: CSS transitions and micro-interactions
- **Responsive Grid**: Mobile-first responsive design

### Component Library
- **Cards**: Glass morphism match and team cards
- **Buttons**: Modern interactive buttons with states
- **Navigation**: Clean sidebar and mobile navigation
- **Forms**: Consistent form styling with validation
- **Icons**: Comprehensive icon system
- **Modals**: Overlay modals for detailed views

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Set up local Supabase environment
4. Make your changes and test thoroughly
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards
- Follow React best practices and hooks patterns
- Use TypeScript-style JSDoc comments
- Follow the existing component structure
- Test new features thoroughly
- Maintain responsive design principles

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for the incredible backend platform
- **API-Football** for comprehensive sports data
- **React Team** for the amazing framework  
- **Tailwind CSS** for utility-first styling
- **Vercel** for seamless deployment platform

## 📞 Support

- **Documentation**: Check `supabase_setup_guide.md` for setup help
- **Issues**: [GitHub Issues](https://github.com/yourusername/arebet-sports-platform/issues)
- **Security**: Report security issues responsibly

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Complete API endpoint implementation
- ✅ Real-time data synchronization
- ✅ Modern responsive UI
- ✅ Advanced caching system

### Phase 2 (Next)
- [ ] User authentication and profiles
- [ ] Personal betting tracker
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Social features and communities

### Phase 3 (Future)
- [ ] Machine learning predictions
- [ ] Live streaming integration
- [ ] Multi-language support
- [ ] Advanced betting features
- [ ] API for third-party integration

---

**Built with ❤️ using React + Supabase**

*The future of sports betting platforms - fast, modern, and reliable.*