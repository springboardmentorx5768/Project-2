import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('.env file not found');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim().replace(/^["']|["']$/g, ''); // remove quotes
  }
});

const SUPABASE_URL = envVars.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = envVars.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.log('API key or URL not set in .env');
  process.exit(1);
}

console.log('Testing API key...');

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function test() {
  try {
    // Try to get the current user or a simple auth check
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('Error:', error.message);
      if (error.message.includes('Invalid API key') || error.message.includes('invalid') || error.code === 'invalid_api_key') {
        console.log('API key is invalid');
      } else {
        console.log('API key may be valid, but auth error:', error.message);
      }
    } else {
      console.log('API key is valid');
    }
  } catch (e) {
    console.log('Exception:', e.message);
    if (e.message.includes('Invalid API key') || e.message.includes('invalid')) {
      console.log('API key is invalid');
    } else {
      console.log('Unexpected error');
    }
  }
}

test();
