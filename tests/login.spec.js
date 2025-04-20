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

  // Verify version information and README link are present
  const versionElement = await page.locator('text=/Version|version/i').first();
  expect(versionElement).toBeVisible();
  const versionText = await versionElement.textContent();
  expect(versionText).toMatch(/\d+\.\d+\.\d+ .*/);

  // Verify README link exists and has correct attributes
  const readmeLink = await page.locator('a:has-text("README")');
  await expect(readmeLink).toBeVisible();
  await expect(readmeLink).toHaveAttribute('href', 'https://github.com/klaushofrichter/SwiftEventWeb/blob/develop/README.md');
  await expect(readmeLink).toHaveAttribute('target', '_blank');
  await expect(readmeLink).toHaveAttribute('rel', 'noopener noreferrer');
 
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
  await expect(page.locator('h2').filter({ hasText: 'Metrics' })).toBeVisible();
  await expect(page.locator('h2').filter({ hasText: 'Notification Settings' })).toBeVisible();

  // Verify README link exists and has correct attributes on dashboard
  const dashboardReadmeLink = await page.locator('a:has-text("README")');
  await expect(dashboardReadmeLink).toBeVisible();
  await expect(dashboardReadmeLink).toHaveAttribute('href', 'https://github.com/klaushofrichter/SwiftEventWeb/blob/develop/README.md');
  await expect(dashboardReadmeLink).toHaveAttribute('target', '_blank');
  await expect(dashboardReadmeLink).toHaveAttribute('rel', 'noopener noreferrer');

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

test('verify login fails with wrong API key', async ({ page }) => {
  // Get credentials from environment variables
  const username = process.env.VITE_SWIFT_SENSORS_USER;
  const password = process.env.VITE_SWIFT_SENSORS_PASSWORD;

  if (!username || !password) {
    throw new Error('Missing required environment variables: VITE_SWIFT_SENSORS_USER and VITE_SWIFT_SENSORS_PASSWORD');
  }

  // Navigate to login page
  await page.goto(process.env.PLAYWRIGHT_TEST_BASE_URL || '/');

  // Fill in login form with correct credentials but wrong API key
  await page.locator('input[name="email"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('input[name="api-key"]').fill('wrong-api-key-123');
  
  // Click login button
  await page.locator('button[type="submit"]').click();

  // Verify error message is displayed
  await expect(page.locator('text=Login failed')).toBeVisible();

  // Verify we're still on the login page
  await expect(page).toHaveURL(/.*login/);

  // Verify the form is still present and enabled
  await expect(page.locator('input[name="email"]')).toBeEnabled();
  await expect(page.locator('input[name="password"]')).toBeEnabled();
  await expect(page.locator('input[name="api-key"]')).toBeEnabled();
});

test('verify login with custom API key and logout', async ({ page }) => {
  // Get credentials from environment variables
  const username = process.env.VITE_SWIFT_SENSORS_USER;
  const password = process.env.VITE_SWIFT_SENSORS_PASSWORD;
  const apiKey = process.env.VITE_SWIFT_SENSORS_API_KEY;

  if (!username || !password || !apiKey) {
    throw new Error('Missing required environment variables: VITE_SWIFT_SENSORS_USER, VITE_SWIFT_SENSORS_PASSWORD, and VITE_SWIFT_SENSORS_API_KEY');
  }

  // Navigate to login page
  await page.goto(process.env.PLAYWRIGHT_TEST_BASE_URL || '/');

  // Fill in login form with credentials and API key
  await page.locator('input[name="email"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('input[name="api-key"]').fill(apiKey);
  
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
  await expect(page.locator('h2').filter({ hasText: 'Metrics' })).toBeVisible();
  await expect(page.locator('h2').filter({ hasText: 'Notification Settings' })).toBeVisible();

  // Verify README link exists and has correct attributes on dashboard
  const dashboardReadmeLink = await page.locator('a:has-text("README")');
  await expect(dashboardReadmeLink).toBeVisible();
  await expect(dashboardReadmeLink).toHaveAttribute('href', 'https://github.com/klaushofrichter/SwiftEventWeb/blob/develop/README.md');
  await expect(dashboardReadmeLink).toHaveAttribute('target', '_blank');
  await expect(dashboardReadmeLink).toHaveAttribute('rel', 'noopener noreferrer');

  // Click the logout button (assuming it's in the navigation)
  await page.locator('button:has-text("Logout")').click();

  // Verify we're back on the login page
  await page.waitForURL('**/login');
  await expect(page).toHaveURL(/.*login/);

  // Verify login form is visible
  await expect(page.locator('form')).toBeVisible();
  await expect(page.locator('input[name="email"]')).toBeEmpty();
  await expect(page.locator('input[name="password"]')).toBeEmpty();
  await expect(page.locator('input[name="api-key"]')).toBeEmpty();
});

test('verify README link is valid and accessible', async ({ page, request }) => {
  // Navigate to login page
  await page.goto(process.env.PLAYWRIGHT_TEST_BASE_URL || '/');

  // Get the README link
  const readmeLink = await page.locator('a:has-text("README")');
  await expect(readmeLink).toBeVisible();
  
  // Get the href attribute
  const href = await readmeLink.getAttribute('href');
  expect(href).toBe('https://github.com/klaushofrichter/SwiftEventWeb/blob/develop/README.md');

  // Verify the link is accessible
  const response = await request.get(href);
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);

  // Navigate to dashboard (need to login first)
  const username = process.env.VITE_SWIFT_SENSORS_USER;
  const password = process.env.VITE_SWIFT_SENSORS_PASSWORD;

  if (!username || !password) {
    throw new Error('Missing required environment variables: VITE_SWIFT_SENSORS_USER and VITE_SWIFT_SENSORS_PASSWORD');
  }

  await page.locator('input[name="email"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/dashboard', { timeout: 60000 });

  // Check README link on dashboard
  const dashboardReadmeLink = await page.locator('a:has-text("README")');
  await expect(dashboardReadmeLink).toBeVisible();
  
  // Verify dashboard README link
  const dashboardHref = await dashboardReadmeLink.getAttribute('href');
  expect(dashboardHref).toBe('https://github.com/klaushofrichter/SwiftEventWeb/blob/develop/README.md');

  // Verify the dashboard link is also accessible
  const dashboardResponse = await request.get(dashboardHref);
  expect(dashboardResponse.ok()).toBeTruthy();
  expect(dashboardResponse.status()).toBe(200);
}); 