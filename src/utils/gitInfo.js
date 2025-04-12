export function getVersion() {
  try {
    return import.meta.env.VITE_APP_VERSION || 'Unknown';
  } catch (error) {
    console.error('Error getting version:', error);
    return 'Unknown';
  }
} 