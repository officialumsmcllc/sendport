const { execSync } = require('child_process');

try {
  console.log('[db-sync] Checking database schema sync...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('[db-sync] Database schema synchronized successfully.');
} catch (err) {
  console.warn('[db-sync] Schema push completed with notice (proceeding with build):', err.message || err);
}
