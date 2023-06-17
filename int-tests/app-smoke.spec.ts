/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from '@playwright/test';

const pageUrl = 'http://localhost:3000'

test('Page should have title', async ({ page }) => {
  await page.goto(pageUrl);

  const title = page.getByText('The Order book: PI_XBTUSD')
  expect(title).toBeDefined()
});  

test('Page should show loading data before render order table', async ({ page }) => {
  await page.goto(pageUrl);

  const title = page.getByText('Loading data...')
  expect(title).toBeDefined()

  await page.locator('[role="ORDER_TABLE"]').waitFor()
  await page.locator('[data-testid="LOADING_TEST"]').waitFor({state: 'hidden'})
});  

test("Switch button works as expect", async ({page}) => {
  await page.goto(pageUrl);

  await page.locator('[role="ORDER_TABLE"]').waitFor()
  await page.locator('[data-testid="LOADING_TEST"]').waitFor({state: 'hidden'})
  expect(page.getByText('The Order book: PI_XBTUSD')).toBeDefined()

  const swBtn = page.getByText('Toggle feed')
  await swBtn.click()

  expect(page.getByText('The Order book: PI_ETHUSD')).toBeDefined()
  
})

test("Kill feed button works as expect", async ({page}) => {
  await page.goto(pageUrl);

  await page.locator('[role="ORDER_TABLE"]').waitFor()
  await page.locator('[data-testid="LOADING_TEST"]').waitFor({state: 'hidden'})
  
  const killBtn = page.getByText('Kill feed')
  await killBtn.click()

  await page.locator('#toast-1-title').waitFor()
  
})

