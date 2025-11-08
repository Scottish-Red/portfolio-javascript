/**
 * End-to-End Tests for Beans Game - Edge Cases & Accessibility
 * 
 * Tests edge cases, error handling, and accessibility features:
 * - Browser compatibility
 * - Keyboard navigation
 * - Page responsiveness
 * - Error handling
 */

const { test, expect } = require('@playwright/test');
const { BeansGameHelpers } = require('./helpers');

test.describe('Beans Game - Edge Cases & Accessibility', () => {
  let helpers;

  test.beforeEach(async ({ page }) => {
    helpers = new BeansGameHelpers(page);
    await helpers.goto();
  });

  test('should handle page reload gracefully', async ({ page }) => {
    // Place some beans
    await helpers.placeBeans([
      { row: 0, col: 0 },
      { row: 1, col: 2 },
    ]);

    expect(await helpers.getBeansPlacedCount()).toBe(2);

    // Reload page
    await page.reload();
    await page.waitForSelector('.game-board .cell');

    // Board should be reset with a new game
    const count = await helpers.getBeansPlacedCount();
    expect(count).toBe(0);

    // Timer should be reset
    const timer = await helpers.getTimerValue();
    expect(timer).toMatch(/^00:0[0-9]$/);
  });

  test('should have proper meta tags', async ({ page }) => {
    // Check viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', 'width=device-width, initial-scale=1.0');

    // Check charset
    const charset = await page.locator('meta[charset]');
    await expect(charset).toHaveAttribute('charset', 'UTF-8');
  });

  test('should load CSS and JavaScript files', async ({ page }) => {
    // Check if styles.css is loaded
    const stylesheets = await page.locator('link[rel="stylesheet"]').count();
    expect(stylesheets).toBeGreaterThan(0);

    // Check if scripts.js is loaded
    const scripts = await page.locator('script[src="scripts.js"]').count();
    expect(scripts).toBe(1);
  });

  test('should display game info panel', async ({ page }) => {
    const gameInfo = page.locator('.game-info');
    await expect(gameInfo).toBeVisible();

    // Should show rules
    const rules = page.locator('.rules');
    await expect(rules).toBeVisible();

    // Should show stats
    const stats = page.locator('.game-stats');
    await expect(stats).toBeVisible();
  });

  test('should handle clicking outside the game board', async ({ page }) => {
    // Click on the header
    await page.click('h1');

    // Game should still be functional
    await helpers.leftClickCell(0, 0);
    expect(await helpers.cellHasBean(0, 0)).toBe(true);
  });

  test('should maintain consistent cell size', async ({ page }) => {
    const cells = page.locator('.cell');
    const firstCell = cells.first();
    const lastCell = cells.last();

    const firstBox = await firstCell.boundingBox();
    const lastBox = await lastCell.boundingBox();

    // All cells should have similar dimensions
    expect(Math.abs(firstBox.width - lastBox.width)).toBeLessThan(2);
    expect(Math.abs(firstBox.height - lastBox.height)).toBeLessThan(2);
  });

  test('should have accessible button labels', async ({ page }) => {
    // Check all buttons have text content
    const newGameBtn = page.locator('#newGame');
    await expect(newGameBtn).toContainText('New Game');

    const checkBtn = page.locator('#checkSolution');
    await expect(checkBtn).toContainText('Check Solution');

    const showBtn = page.locator('#showSolution');
    await expect(showBtn).toContainText('Show Solution');

    const clearBtn = page.locator('#clearBoard');
    await expect(clearBtn).toContainText('Clear Board');
  });

  test('should display instructions for controls', async ({ page }) => {
    const controlsInfo = page.locator('.controls-info');
    await expect(controlsInfo).toBeVisible();

    const text = await controlsInfo.textContent();
    expect(text).toContain('Left-click');
    expect(text).toContain('Right-click');
  });

  test('should handle rapid New Game clicks', async ({ page }) => {
    // Click New Game multiple times rapidly
    for (let i = 0; i < 5; i++) {
      await helpers.clickNewGame();
    }

    // Should still have a valid board
    await helpers.verifyBoardRendered();

    // Should be in playable state
    await helpers.leftClickCell(0, 0);
    expect(await helpers.cellHasBean(0, 0)).toBe(true);
  });

  test('should handle Show Solution then immediately New Game', async ({ page }) => {
    await helpers.clickShowSolution();
    await page.waitForTimeout(100);

    await helpers.clickNewGame();
    await page.waitForTimeout(100);

    // Should be able to play new game
    const count = await helpers.getBeansPlacedCount();
    expect(count).toBe(0);

    await helpers.leftClickCell(0, 0);
    expect(await helpers.cellHasBean(0, 0)).toBe(true);
  });

  test('should toggle auto-fill X multiple times', async ({ page }) => {
    const checkbox = page.locator('#autoFillX');

    // Initial state (checked)
    expect(await checkbox.isChecked()).toBe(true);

    // Toggle off
    await checkbox.click();
    expect(await checkbox.isChecked()).toBe(false);

    // Toggle on
    await checkbox.click();
    expect(await checkbox.isChecked()).toBe(true);

    // Game should still work
    await helpers.leftClickCell(2, 2);
    expect(await helpers.cellHasBean(2, 2)).toBe(true);
  });

  test('should handle placing and removing beans in same cell repeatedly', async () => {
    // Place and remove same bean 10 times
    for (let i = 0; i < 10; i++) {
      await helpers.leftClickCell(3, 3);
      await helpers.leftClickCell(3, 3);
    }

    // Should end with no bean
    expect(await helpers.cellHasBean(3, 3)).toBe(false);
    expect(await helpers.getBeansPlacedCount()).toBe(0);
  });

  test('should handle alternating bean and X placement', async () => {
    // Left click to place bean
    await helpers.leftClickCell(4, 4);
    expect(await helpers.cellHasBean(4, 4)).toBe(true);

    // Can't place X when bean exists - right-click should show message or be ignored
    await helpers.rightClickCell(4, 4);
    // Bean should still be there
    expect(await helpers.cellHasBean(4, 4)).toBe(true);
    
    // Remove bean
    await helpers.leftClickCell(4, 4);
    expect(await helpers.cellHasBean(4, 4)).toBe(false);
    
    // Now we can place X marker
    await helpers.rightClickCell(4, 4);
    expect(await helpers.cellHasX(4, 4)).toBe(true);
    
    // Can't place bean when X exists
    // Remove X first
    await helpers.rightClickCell(4, 4);
    expect(await helpers.cellHasX(4, 4)).toBe(false);
    
    // Now place bean again
    await helpers.leftClickCell(4, 4);
    expect(await helpers.cellHasBean(4, 4)).toBe(true);
  });

  test('should maintain visual feedback on hover', async ({ page }) => {
    const cell = helpers.getCell(0, 0);
    
    // Hover over cell
    await cell.hover();

    // Cell should be visible and interactive
    await expect(cell).toBeVisible();
  });

  test('should display region numbers correctly', async ({ page }) => {
    // Check that regions are numbered 0-7
    const regionClasses = new Set();

    for (let i = 0; i < 64; i++) {
      const cell = page.locator('.cell').nth(i);
      const classes = await cell.getAttribute('class');
      const match = classes.match(/region-(\d)/);
      if (match) {
        regionClasses.add(parseInt(match[1]));
      }
    }

    // Should have exactly 8 different regions (0-7)
    expect(regionClasses.size).toBe(8);
    for (let i = 0; i < 8; i++) {
      expect(regionClasses.has(i)).toBe(true);
    }
  });

  test('should handle Clear Board with no beans placed', async () => {
    // Clear empty board
    await helpers.clickClearBoard();

    // Should not cause errors
    expect(await helpers.getBeansPlacedCount()).toBe(0);
  });

  test('should handle Check Solution with no beans', async () => {
    await helpers.clickCheckSolution();

    // Should show error message
    const isVisible = await helpers.isMessageVisible();
    expect(isVisible).toBe(true);

    const message = await helpers.getMessageText();
    expect(message.length).toBeGreaterThan(0);
  });

  test('should have responsive container', async ({ page }) => {
    const container = page.locator('.container');
    const box = await container.boundingBox();

    // Container should have reasonable dimensions
    expect(box.width).toBeGreaterThan(300);
    expect(box.height).toBeGreaterThan(400);
  });

  test('should display subtitle', async ({ page }) => {
    const subtitle = page.locator('.subtitle');
    await expect(subtitle).toBeVisible();
    await expect(subtitle).toContainText('Place the lilac beans following the rules!');
  });

  test('should handle multiple Check Solution calls', async () => {
    // Place invalid solution
    await helpers.placeBeans([
      { row: 0, col: 0 },
      { row: 0, col: 1 },
    ]);

    // Check multiple times
    for (let i = 0; i < 3; i++) {
      await helpers.clickCheckSolution();
      const isVisible = await helpers.isMessageVisible();
      expect(isVisible).toBe(true);
    }
  });

  test('should complete full game cycle', async ({ page }) => {
    // Start new game
    await helpers.clickNewGame();
    
    // Show solution
    await helpers.clickShowSolution();
    await page.waitForTimeout(200);
    
    const solutionBeans = await helpers.getAllBeansPositions();
    expect(solutionBeans.length).toBe(8);
    
    // Start another new game
    await helpers.clickNewGame();
    await page.waitForTimeout(200);
    
    // Place the previous solution
    await helpers.placeBeans(solutionBeans);
    
    // Check solution (might be correct or incorrect depending on new puzzle)
    await helpers.clickCheckSolution();
    const isVisible = await helpers.isMessageVisible();
    expect(isVisible).toBe(true);
  });

  test('should have proper page title', async ({ page }) => {
    await expect(page).toHaveTitle('Beans - Logic Puzzle Game');
  });

  test('should display emoji in header', async ({ page }) => {
    const header = page.locator('h1');
    const text = await header.textContent();
    expect(text).toContain('🫘');
  });

  test('should format timer with leading zeros', async () => {
    const timer = await helpers.getTimerValue();
    // Should match format MM:SS
    expect(timer).toMatch(/^\d{2}:\d{2}$/);
  });
});
