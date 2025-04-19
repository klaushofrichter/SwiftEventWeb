import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env file for local testing
dotenv.config();

test('login and verify dashboard', async ({ page }) => {
  // Get credentials from environment variables
  const username = process.env.VITE_SWIFT_SENSORS_USER;
  const password = process.env.VITE_SWIFT_SENSORS_PASSWORD;

  if (!username || !password) {
    throw new Error('Missing required environment variables: VITE_SWIFT_SENSORS_USER and VITE_SWIFT_SENSORS_PASSWORD');
  }

  // Navigate to login page
  await page.goto(process.env.PLAYWRIGHT_TEST_BASE_URL || '/');

  // Verify version information is present 
  const versionElement = await page.locator('text=/Version|version/i').first();
  expect(versionElement).toBeVisible();
  const versionText = await versionElement.textContent();
  expect(versionText).toMatch(/\d+\.\d+\.\d+ .*/);
 
  // Wait for the login form to be visible
  await page.waitForSelector('form');

  // Fill in login form with more specific selectors
  await page.locator('input[name="email"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  
  // Click login button
  await page.locator('button[type="submit"]').click();

  // Wait for navigation to dashboard
  await page.waitForURL('**/dashboard', { timeout: 60000 });

  // Verify we're on the dashboard
  await expect(page).toHaveURL(/.*dashboard/);
  
  // Wait for dashboard content to load
  await page.waitForSelector('h1');
  
  // Verify dashboard elements are present
  await expect(page.locator('h1')).toContainText('Dashboard');

  // Verify section titles
  await expect(page.locator('h2').filter({ hasText: 'Account Information' })).toBeVisible();
  await expect(page.locator('h2').filter({ hasText: 'Devices' })).toBeVisible();
  await expect(page.locator('h2').filter({ hasText: 'Sensors' })).toBeVisible();
  await expect(page.locator('h2').filter({ hasText: 'Notifications' })).toBeVisible();

  // Wait for the update button to be visible
  const updateButton = await page.locator('button:has-text("Update")').first();
  await updateButton.waitFor({ state: 'visible', timeout: 10000 });

  // Click update button and wait for it to be visible again
  await updateButton.click();
  await updateButton.waitFor({ state: 'visible', timeout: 30000 });

  // Verify loading states are not present
  await expect(page.locator('text=Loading...')).not.toBeVisible();
});

test('verify login error handling', async ({ page }) => {
  // Navigate to login page
  await page.goto(process.env.PLAYWRIGHT_TEST_BASE_URL || '/');

  // Try to login with invalid credentials
  await page.locator('input[name="email"]').fill('invalid@example.com');
  await page.locator('input[name="password"]').fill('wrongpassword');
  await page.locator('button[type="submit"]').click();

  // Verify error message is displayed
  await expect(page.locator('text=Login failed')).toBeVisible();

  // Verify we're still on the login page
  await expect(page).toHaveURL(/.*login/);
}); 