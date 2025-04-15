import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

test('login and verify dashboard', async ({ page }) => {
  // Navigate to login page
  await page.goto('/');

  // Wait for the login form to be visible
  await page.waitForSelector('form');

  // Fill in login form with more specific selectors
  await page.locator('input[name="email"]').fill(process.env.VITE_SWIFT_SENSORS_USER);
  await page.locator('input[name="password"]').fill(process.env.VITE_SWIFT_SENSORS_PASSWORD);
  
  // Click login button
  await page.locator('button[type="submit"]').click();

  // Wait for navigation to dashboard with a longer timeout
  await page.waitForURL('**/dashboard', { timeout: 60000 });

  // Verify we're on the dashboard
  await expect(page).toHaveURL(/.*dashboard/);
  
  // Wait for dashboard content to load
  await page.waitForSelector('h1');
  
  // Verify dashboard elements are present
  await expect(page.locator('h1')).toContainText('Dashboard');
}); 