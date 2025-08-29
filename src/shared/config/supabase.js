// ===============================================
// SUPABASE CONFIGURATION
// Centralized configuration for Supabase client
// ===============================================

import { createClient } from '@supabase/supabase-js';

// Environment variables with fallbacks for development
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://mock-supabase.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Validate environment variables
if (!supabaseUrl.includes('supabase.co') && process.env.NODE_ENV === 'production') {
  console.error('❌ SUPABASE_URL not properly configured for production');
}

if (!supabaseAnonKey.startsWith('eyJ') && process.env.NODE_ENV === 'production') {
  console.error('❌ SUPABASE_ANON_KEY not properly configured for production');
}

// Development warning for mock credentials
if (process.env.NODE_ENV === 'development' && supabaseUrl === 'https://mock-supabase.supabase.co') {
  console.warn('⚠️  Using mock Supabase credentials for development. Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to .env for real functionality.');
}

// Supabase client configuration
const supabaseConfig = {
  auth: {
    // Enable auto-refresh of sessions
    autoRefreshToken: true,
    // Persist auth state in localStorage
    persistSession: true,
    // Detect session from URL hash (for magic links, password reset, etc.)
    detectSessionInUrl: true,
    // Custom storage key for multiple apps
    storageKey: 'arebet-auth-token',
    // Flow type for auth redirects
    flowType: 'pkce'
  },
  // Global API options
  global: {
    headers: {
      'x-application-name': 'AreBet Sports Platform'
    }
  },
  // Database schema (if using multiple schemas)
  db: {
    schema: 'public'
  }
};

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseConfig);

// Auth configuration constants
export const AUTH_CONFIG = {
  // Password requirements
  passwordRequirements: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false
  },
  
  // Session configuration
  session: {
    refreshThreshold: 60, // Refresh token when < 60 seconds remaining
    maxRetries: 3,
    retryDelay: 1000
  },
  
  // OAuth providers (for future implementation)
  providers: {
    google: {
      enabled: false,
      scopes: 'email profile'
    },
    github: {
      enabled: false,
      scopes: 'user:email'
    },
    twitter: {
      enabled: false
    }
  },
  
  // Email templates (for future customization)
  email: {
    confirmationTemplate: 'confirmation',
    resetPasswordTemplate: 'reset_password',
    inviteTemplate: 'invite'
  },
  
  // Redirect URLs
  redirects: {
    signIn: window?.location?.origin || 'http://localhost:3000',
    signOut: window?.location?.origin || 'http://localhost:3000',
    passwordReset: `${window?.location?.origin || 'http://localhost:3000'}/reset-password`
  }
};

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl.includes('supabase.co') && supabaseAnonKey.startsWith('eyJ');
};

// Helper function to get current environment
export const getEnvironment = () => {
  if (process.env.NODE_ENV === 'production') return 'production';
  if (process.env.NODE_ENV === 'development') return 'development';
  return 'unknown';
};

export default supabase;