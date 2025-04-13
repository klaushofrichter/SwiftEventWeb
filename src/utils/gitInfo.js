export function getVersion() {
  try {
    const version = import.meta.env.VITE_APP_VERSION || 'Unknown';
    const lastCommit = import.meta.env.VITE_APP_LAST_COMMIT || '';
    return `${version}${lastCommit ? ` (${lastCommit})` : ''}`;
  } catch (error) {
    console.error('Error getting version:', error);
    return 'Unknown';
  }
} 