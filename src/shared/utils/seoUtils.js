// ===============================================
// SEO OPTIMIZATION UTILITIES
// Advanced SEO helpers for better search visibility
// ===============================================

import React from 'react';

// Dynamic meta tags management
export class SEOManager {
  constructor() {
    this.defaultMeta = {
      title: 'AreBet - Sports Analytics Platform',
      description: 'Premium sports betting analytics platform with live match data and AI predictions',
      keywords: 'sports betting, football analytics, match predictions, betting tips, live scores',
      image: '/og-image.png',
      url: 'https://arebet.vercel.app'
    };
  }

  // Update page meta tags dynamically
  updatePageMeta(metaData) {
    const meta = { ...this.defaultMeta, ...metaData };
    
    // Update title
    document.title = meta.title;
    
    // Update meta tags
    this.updateMetaTag('description', meta.description);
    this.updateMetaTag('keywords', meta.keywords);
    
    // Update Open Graph tags
    this.updateMetaProperty('og:title', meta.title);
    this.updateMetaProperty('og:description', meta.description);
    this.updateMetaProperty('og:image', meta.image);
    this.updateMetaProperty('og:url', meta.url);
    
    // Update Twitter Card tags
    this.updateMetaName('twitter:title', meta.title);
    this.updateMetaName('twitter:description', meta.description);
    this.updateMetaName('twitter:image', meta.image);
    
    // Update canonical URL
    this.updateCanonicalUrl(meta.url);
  }

  updateMetaTag(name, content) {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = name;
      document.head.appendChild(meta);
    }
    meta.content = content;
  }

  updateMetaProperty(property, content) {
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.content = content;
  }

  updateMetaName(name, content) {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = name;
      document.head.appendChild(meta);
    }
    meta.content = content;
  }

  updateCanonicalUrl(url) {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }

  // Generate structured data for matches
  generateMatchStructuredData(match) {
    return {
      '@context': 'https://schema.org',
      '@type': 'SportsEvent',
      name: `${match.homeTeam} vs ${match.awayTeam}`,
      description: `${match.league} match between ${match.homeTeam} and ${match.awayTeam}`,
      startDate: match.date,
      location: {
        '@type': 'Place',
        name: match.venue || 'TBD'
      },
      competitor: [
        {
          '@type': 'SportsTeam',
          name: match.homeTeam,
          logo: match.homeTeamLogo
        },
        {
          '@type': 'SportsTeam', 
          name: match.awayTeam,
          logo: match.awayTeamLogo
        }
      ],
      organizer: {
        '@type': 'SportsOrganization',
        name: match.league
      }
    };
  }

  // Generate structured data for leagues
  generateLeagueStructuredData(league) {
    return {
      '@context': 'https://schema.org',
      '@type': 'SportsOrganization',
      name: league.name,
      description: `${league.name} standings, fixtures, and analytics`,
      logo: league.logo,
      sport: 'Football',
      memberOf: {
        '@type': 'SportsOrganization',
        name: 'European Football'
      }
    };
  }

  // Inject structured data into page
  injectStructuredData(data) {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]#dynamic-seo');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'dynamic-seo';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }
}

// Page-specific SEO configurations
export const pageConfigs = {
  home: {
    title: 'AreBet - Premium Sports Analytics Platform',
    description: 'Get professional sports betting insights with live match data, AI-powered predictions, and comprehensive analytics from Europe\'s top leagues.',
    keywords: 'sports betting platform, football analytics, live match data, betting insights, sports predictions',
    url: 'https://arebet.vercel.app/'
  },
  
  live: {
    title: 'Live Matches - AreBet Sports Analytics',
    description: 'Follow live football matches with real-time updates, statistics, and betting insights from Premier League, La Liga, and Bundesliga.',
    keywords: 'live football matches, real-time sports updates, live betting odds, match statistics',
    url: 'https://arebet.vercel.app/live'
  },
  
  fixtures: {
    title: 'Football Fixtures - AreBet Analytics',
    description: 'Upcoming football fixtures with predictions, team form analysis, and betting insights from top European leagues.',
    keywords: 'football fixtures, upcoming matches, match predictions, team analysis',
    url: 'https://arebet.vercel.app/fixtures'
  },
  
  table: {
    title: 'League Tables - AreBet Sports Data',
    description: 'Complete league standings for Premier League, La Liga, Bundesliga with detailed team statistics and form guides.',
    keywords: 'football league tables, team standings, league positions, team statistics',
    url: 'https://arebet.vercel.app/table'
  },
  
  stats: {
    title: 'Football Statistics - AreBet Analytics',
    description: 'In-depth football statistics, team performance metrics, player data, and analytical insights for better betting decisions.',
    keywords: 'football statistics, team performance, player stats, analytical insights',
    url: 'https://arebet.vercel.app/stats'
  },
  
  subscription: {
    title: 'Premium Features - AreBet Subscription',
    description: 'Upgrade to AreBet Premium for advanced analytics, exclusive predictions, priority support, and comprehensive betting insights.',
    keywords: 'premium sports analytics, advanced betting features, subscription plans, exclusive predictions',
    url: 'https://arebet.vercel.app/subscription'
  }
};

// SEO optimization hooks for React components
export const useSEO = (pageKey, dynamicData = {}) => {
  const seoManager = new SEOManager();
  
  React.useEffect(() => {
    const config = pageConfigs[pageKey] || pageConfigs.home;
    const metaData = {
      ...config,
      ...dynamicData
    };
    
    seoManager.updatePageMeta(metaData);
    
    // Cleanup function to reset to default when component unmounts
    return () => {
      if (pageKey !== 'home') {
        seoManager.updatePageMeta(pageConfigs.home);
      }
    };
  }, [pageKey, dynamicData, seoManager]);
  
  return seoManager;
};

// Generate sitemap data
export const generateSitemapData = () => {
  const baseUrl = 'https://arebet.vercel.app';
  const pages = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/live', priority: '0.9', changefreq: 'always' },
    { loc: '/fixtures', priority: '0.8', changefreq: 'daily' },
    { loc: '/table', priority: '0.7', changefreq: 'weekly' },
    { loc: '/stats', priority: '0.7', changefreq: 'weekly' },
    { loc: '/subscription', priority: '0.6', changefreq: 'monthly' }
  ];
  
  return pages.map(page => ({
    ...page,
    loc: `${baseUrl}${page.loc}`,
    lastmod: new Date().toISOString()
  }));
};

// Performance monitoring for SEO
export const trackSEOMetrics = () => {
  if (typeof window === 'undefined') return;
  
  // Track Core Web Vitals
  if ('PerformanceObserver' in window) {
    // Largest Contentful Paint
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime);
          // Send to analytics
        }
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // First Input Delay
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        const fid = entry.processingStart - entry.startTime;
        console.log('FID:', fid);
        // Send to analytics
      }
    }).observe({ entryTypes: ['first-input'] });
  }
  
  // Track page views for SEO
  const trackPageView = (path) => {
    // Analytics tracking would go here
    console.log('Page view:', path);
  };
  
  return { trackPageView };
};

// Generate breadcrumb structured data
export const generateBreadcrumbStructuredData = (breadcrumbs) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  };
};

// Singleton instance
export const seoManager = new SEOManager();

export default {
  SEOManager,
  pageConfigs,
  useSEO,
  generateSitemapData,
  trackSEOMetrics,
  generateBreadcrumbStructuredData,
  seoManager
};