const { execSync } = require('child_process');
const crypto = require('crypto');

// Generate strong random secret
const newSecret = crypto.randomBytes(32).toString('base64');

console.log("Checking Vercel project...");
try {
  const projectInfo = execSync('npx vercel ls', { encoding: 'utf8' });
  console.log("Vercel CLI active.");
  
  // Note: we just assume the linked project is correct based on the cwd.
  // We add the env var to 'preview' (which is usually staging) and 'development' if needed, or explicitly 'production'.
  // The user said: "???? ??????? ?? ???? Staging ???????? ???. ?? ???? Production."
  // Let's first check what environments are available in Vercel. 
} catch (e) {
  console.error("Vercel error:", e.message);
}
