/**
 * Example Test Template for Beans Game
 * 
 * Copy this template to create your own tests.
 * This file demonstrates common testing patterns.
 */

const { test, expect } = require('@playwright/test');
const { BeansGameHelpers } = require('./helpers');

test.describe('Beans Game - Example Tests', () => {
  let helpers;

  // This runs before each test
  test.beforeEach(async ({ page }) => {
    helpers = new BeansGameHelpers(page);
    await helpers.goto();
  });

  // Example 1: Simple interaction test
  test('example: should interact with a cell', async () => {
    // Click a cell
    await helpers.leftClickCell(0, 0);
    
    // Verify bean was placed
    const hasBean = await helpers.cellHasBean(0, 0);
    expect(hasBean).toBe(true);
  });

  // Example 2: Testing game controls
  test('example: should use game controls', async () => {
    // Place some beans
    await helpers.placeBeans([
      { row: 1, col: 1 },
      { row: 2, col: 3 },
    ]);
    
    // Verify counter
    const count = await helpers.getBeansPlacedCount();
    expect(count).toBe(2);
    
    // Clear the board
    await helpers.clickClearBoard();
    
    // Verify cleared
    expect(await helpers.getBeansPlacedCount()).toBe(0);
  });

  // Example 3: Testing UI elements
  test('example: should check UI elements', async ({ page }) => {
    // Check if button exists
    const newGameBtn = page.locator('#newGame');
    await expect(newGameBtn).toBeVisible();
    
    // Check button text
    await expect(newGameBtn).toContainText('New Game');
  });

  // Example 4: Testing with setup
  test('example: should test with specific board state', async ({ page }) => {
    // Disable auto-fill for predictable behavior
    await helpers.setAutoFillX(false);
    
    // Create a specific board state
    await helpers.placeBeans([
      { row: 0, col: 0 },
      { row: 2, col: 2 },
      { row: 4, col: 4 },
    ]);
    
    // Test something about this state
    const beans = await helpers.getAllBeansPositions();
    expect(beans.length).toBe(3);
    
    // Verify no beans are touching
    await helpers.verifyNoTouchingBeans(beans);
  });

  // Example 5: Testing error conditions
  test('example: should handle errors gracefully', async () => {
    // Try to check solution with no beans
    await helpers.clickCheckSolution();
    
    // Should show an error message
    const isVisible = await helpers.isMessageVisible();
    expect(isVisible).toBe(true);
    
    const message = await helpers.getMessageText();
    expect(message.length).toBeGreaterThan(0);
  });

  // Example 6: Testing timing and delays
  test('example: should handle timing', async ({ page }) => {
    // Get initial timer
    const timer1 = await helpers.getTimerValue();
    
    // Wait a bit
    await page.waitForTimeout(1500);
    
    // Timer should have changed
    const timer2 = await helpers.getTimerValue();
    expect(timer2).not.toBe(timer1);
  });

  // Example 7: Testing multiple actions
  test('example: should handle multiple actions', async () => {
    // Sequence of actions
    await helpers.leftClickCell(0, 0);  // Place bean
    await helpers.leftClickCell(1, 2);  // Place another
    await helpers.rightClickCell(3, 3); // Place X marker
    
    // Verify results
    expect(await helpers.cellHasBean(0, 0)).toBe(true);
    expect(await helpers.cellHasBean(1, 2)).toBe(true);
    expect(await helpers.cellHasX(3, 3)).toBe(true);
    expect(await helpers.getBeansPlacedCount()).toBe(2);
  });

  // Example 8: Skip a test (if needed)
  test.skip('example: this test will be skipped', async () => {
    // This test won't run
  });

  // Example 9: Focus on one test during development
  // Use test.only to run just this test
  // test.only('example: focus on this test', async () => {
  //   await helpers.clickNewGame();
  //   expect(await helpers.getBeansPlacedCount()).toBe(0);
  // });
});
