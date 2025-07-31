const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

function switchEnvironment(env) {
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found. Please create it first using the env-config.txt template.');
    return;
  }

  let envContent = fs.readFileSync(envPath, 'utf8');
  
  if (env === 'local') {
    // Comment out production URL and uncomment local URL
    envContent = envContent.replace(
      /REACT_APP_API_URL=https:\/\/arios-production\.up\.railway\.app\/api/g,
      '# REACT_APP_API_URL=https://arios-back-end-server-production.up.railway.app/api'
    );
    envContent = envContent.replace(
      /# REACT_APP_API_URL=http:\/\/localhost:5000\/api/g,
      'REACT_APP_API_URL=http://localhost:5000/api'
    );
    console.log('✅ Switched to LOCAL environment (http://localhost:5000/api)');
  } else if (env === 'production') {
    // Comment out local URL and uncomment production URL
    envContent = envContent.replace(
      /REACT_APP_API_URL=http:\/\/localhost:5000\/api/g,
      '# REACT_APP_API_URL=http://localhost:5000/api'
    );
    envContent = envContent.replace(
      /# REACT_APP_API_URL=https:\/\/arios-production\.up\.railway\.app\/api/g,
      'REACT_APP_API_URL=https://arios-back-end-server-production.up.railway.app/api'
    );
    console.log('✅ Switched to PRODUCTION environment (https://arios-back-end-server-production.up.railway.app/api)');
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('🔄 Please restart your React development server for changes to take effect.');
}

function showCurrentEnvironment() {
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found.');
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const localMatch = envContent.match(/REACT_APP_API_URL=http:\/\/localhost:5000\/api/);
  const productionMatch = envContent.match(/REACT_APP_API_URL=https:\/\/arios-production\.up\.railway\.app\/api/);

  if (localMatch && !localMatch[0].startsWith('#')) {
    console.log('📍 Current environment: LOCAL (http://localhost:5000/api)');
  } else if (productionMatch && !productionMatch[0].startsWith('#')) {
    console.log('📍 Current environment: PRODUCTION (https://arios-production.up.railway.app/api)');
  } else {
    console.log('❓ Environment not properly configured. Check your .env file.');
  }
}

const command = process.argv[2];

if (command === 'local' || command === 'production') {
  switchEnvironment(command);
} else if (command === 'status') {
  showCurrentEnvironment();
} else {
  console.log('🚀 Arios Environment Switcher');
  console.log('');
  console.log('Usage:');
  console.log('  node switch-env.js local     - Switch to local backend');
  console.log('  node switch-env.js production - Switch to Railway backend');
  console.log('  node switch-env.js status     - Show current environment');
  console.log('');
  console.log('Note: Make sure you have a .env file created from env-config.txt');
} 