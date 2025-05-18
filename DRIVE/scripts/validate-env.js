const fs = require('fs');
const path = require('path');

function validateEnvironment() {
  const requiredFiles = [
    '.env.development',
    '.env.production',
    'webpack.config.js',
    '.babelrc',
    '.eslintrc.js'
  ];

  const requiredDirs = [
    'config',
    'controllers',
    'models',
    'routes',
    'middleware',
    'utils'
  ];

  console.log('Validating environment setup...\n');

  // Check required files
  console.log('Checking required files:');
  requiredFiles.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, file));
    console.log(`${exists ? '✓' : '✗'} ${file}`);
  });

  // Check required directories
  console.log('\nChecking required directories:');
  requiredDirs.forEach(dir => {
    const exists = fs.existsSync(path.join(__dirname, dir));
    console.log(`${exists ? '✓' : '✗'} ${dir}`);
  });

  // Check node_modules
  const hasNodeModules = fs.existsSync(path.join(__dirname, 'node_modules'));
  console.log('\nChecking dependencies:');
  console.log(`${hasNodeModules ? '✓' : '✗'} node_modules`);

  // Load and validate environment variables
  try {
    require('dotenv').config({
      path: `.env.${process.env.NODE_ENV || 'development'}`
    });
    
    const requiredEnvVars = [
      'MONGODB_URI',
      'JWT_SECRET',
      'PORT'
    ];

    console.log('\nChecking environment variables:');
    requiredEnvVars.forEach(envVar => {
      const exists = process.env[envVar] !== undefined;
      console.log(`${exists ? '✓' : '✗'} ${envVar}`);
    });
  } catch (error) {
    console.error('\nError loading environment variables:', error.message);
  }
}

validateEnvironment();
