#!/usr/bin/env node

// ===============================================
// AREBET DATABASE SETUP SCRIPT
// Quick setup utility for new installations
// ===============================================

const fs = require('fs');
const path = require('path');

console.log('🚀 AreBet Database Setup Utility\n');

// Check for environment file
const envPath = path.join(__dirname, '.env.local');
const templatePath = path.join(__dirname, '.env.template');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local from template...');
  
  if (fs.existsSync(templatePath)) {
    fs.copyFileSync(templatePath, envPath);
    console.log('✅ .env.local created from template');
    console.log('⚠️  IMPORTANT: Edit .env.local with your Supabase credentials\n');
  } else {
    console.log('❌ Template file not found');
    console.log('Please create .env.local manually with:');
    console.log('REACT_APP_SUPABASE_URL=your_url');
    console.log('REACT_APP_SUPABASE_ANON_KEY=your_key\n');
  }
} else {
  console.log('✅ .env.local already exists\n');
}

// Display setup instructions
console.log('📋 Setup Instructions:');
console.log('');
console.log('1. 🌐 Create Supabase Project:');
console.log('   → Go to https://supabase.com');
console.log('   → Create new project: "arebet-sports"');
console.log('   → Note your Project URL and anon key');
console.log('');
console.log('2. ⚙️  Configure Environment:');
console.log('   → Edit .env.local with your credentials');
console.log('   → Save the file');
console.log('');
console.log('3. 🗄️  Setup Database:');
console.log('   → Open Supabase Dashboard → SQL Editor');
console.log('   → Copy & paste database-schema.sql');
console.log('   → Run the SQL to create tables');
console.log('');
console.log('4. 📊 Add Sample Data:');
console.log('   → In SQL Editor, copy & paste sample-data.sql');  
console.log('   → Run to add realistic test data');
console.log('');
console.log('5. 🧪 Test Connection:');
console.log('   → Run: npm start');
console.log('   → Check browser console for connection status');
console.log('');
console.log('6. 🎯 Optional - Real Sports Data:');
console.log('   → Get RapidAPI key from https://rapidapi.com');
console.log('   → Subscribe to API-Football');
console.log('   → Add REACT_APP_RAPIDAPI_KEY to .env.local');
console.log('');

// Check if files exist
const requiredFiles = [
  'database-schema.sql',
  'sample-data.sql',
  'SUPABASE_SETUP_GUIDE.md'
];

console.log('📁 File Check:');
requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} (missing)`);
  }
});

console.log('');
console.log('🔗 Useful Links:');
console.log('   • Supabase: https://supabase.com');
console.log('   • RapidAPI: https://rapidapi.com');
console.log('   • API-Football: https://rapidapi.com/api-sports/api/api-football');
console.log('');
console.log('📖 For detailed instructions, see: SUPABASE_SETUP_GUIDE.md');
console.log('❓ Need help? Check the README.md file');
console.log('');
console.log('🎉 Ready to build something amazing!');