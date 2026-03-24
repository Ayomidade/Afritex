// Tokens are stored here after logout
export const tokenBlacklist = new Set();

// Auto-clean expired tokens hourly
setInterval(() => {
  tokenBlacklist.clear();
}, 60 * 60 * 1000);