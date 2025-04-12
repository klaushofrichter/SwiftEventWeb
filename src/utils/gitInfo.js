export function getLastCommitDate() {
  try {
    const { stdout } = require('child_process').execSync('git log -1 --format=%cd --date=format:"%Y-%m-%d %H:%M:%S"');
    return stdout.toString().trim();
  } catch (error) {
    console.error('Error getting last commit date:', error);
    return 'Unknown';
  }
} 