/**
 * Test Helpers for Beans Game End-to-End Tests
 * 
 * This module provides reusable helper functions for interacting with
 * the Beans puzzle game during automated testing.
 */

const { expect } = require('@playwright/test');

/**
 * Helper class for Beans game testing utilities
 */
class BeansGameHelpers {
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to the Beans game page
   */
  async goto() {
    await this.page.goto('/index.html');
    await this.page.waitForLoadState('networkidle');
    // Wait for the game board to be generated
    await this.page.waitForSelector('.game-board .cell', { timeout: 5000 });
  }

  /**
   * Get a cell element by row and column
   * @param {number} row - Row index (0-7)
   * @param {number} col - Column index (0-7)
   * @returns {Promise<import('@playwright/test').Locator>}
   */
  getCell(row, col) {
    return this.page.locator(`.cell[data-row="${row}"][data-col="${col}"]`);
  }

  /**
   * Left-click a cell to place or remove a bean
   * @param {number} row - Row index (0-7)
   * @param {number} col - Column index (0-7)
   */
  async leftClickCell(row, col) {
    const cell = this.getCell(row, col);
    await cell.click();
  }

  /**
   * Right-click a cell to place or remove an X marker
   * @param {number} row - Row index (0-7)
   * @param {number} col - Column index (0-7)
   */
  async rightClickCell(row, col) {
    const cell = this.getCell(row, col);
    await cell.click({ button: 'right' });
  }

  /**
   * Check if a cell has a bean
   * @param {number} row - Row index (0-7)
   * @param {number} col - Column index (0-7)
   * @returns {Promise<boolean>}
   */
  async cellHasBean(row, col) {
    const cell = this.getCell(row, col);
    const classes = await cell.getAttribute('class');
    return classes.includes('bean');
  }

  /**
   * Check if a cell has an X marker
   * @param {number} row - Row index (0-7)
   * @param {number} col - Column index (0-7)
   * @returns {Promise<boolean>}
   */
  async cellHasX(row, col) {
    const cell = this.getCell(row, col);
    // Check if cell contains an x-marker element
    const xMarker = await cell.locator('.x-marker').count();
    return xMarker > 0;
  }

  /**
   * Get the number of beans currently placed on the board
   * @returns {Promise<number>}
   */
  async getBeansPlacedCount() {
    const text = await this.page.locator('#beansPlaced').textContent();
    return parseInt(text, 10);
  }

  /**
   * Get the total beans needed (should always be 8)
   * @returns {Promise<number>}
   */
  async getTotalBeansCount() {
    const text = await this.page.locator('#totalBeans').textContent();
    return parseInt(text, 10);
  }

  /**
   * Get the current timer value
   * @returns {Promise<string>}
   */
  async getTimerValue() {
    return await this.page.locator('#timer').textContent();
  }

  /**
   * Get the current message text (success/error messages)
   * @returns {Promise<string>}
   */
  async getMessageText() {
    return await this.page.locator('#message').textContent();
  }

  /**
   * Check if a message is visible
   * @returns {Promise<boolean>}
   */
  async isMessageVisible() {
    const message = this.page.locator('#message');
    const display = await message.evaluate(el => window.getComputedStyle(el).display);
    return display !== 'none';
  }

  /**
   * Click the New Game button
   */
  async clickNewGame() {
    await this.page.click('#newGame');
    // Wait for board to be regenerated
    await this.page.waitForTimeout(100);
  }

  /**
   * Click the Check Solution button
   */
  async clickCheckSolution() {
    await this.page.click('#checkSolution');
    await this.page.waitForTimeout(100);
  }

  /**
   * Click the Show Solution button
   */
  async clickShowSolution() {
    await this.page.click('#showSolution');
    await this.page.waitForTimeout(100);
  }

  /**
   * Click the Clear Board button
   */
  async clickClearBoard() {
    await this.page.click('#clearBoard');
    await this.page.waitForTimeout(100);
  }

  /**
   * Toggle the auto-fill X checkbox
   * @param {boolean} checked - Whether to check or uncheck
   */
  async setAutoFillX(checked) {
    const checkbox = this.page.locator('#autoFillX');
    const isChecked = await checkbox.isChecked();
    if (isChecked !== checked) {
      await checkbox.click();
    }
  }

  /**
   * Get all cells with beans
   * @returns {Promise<Array<{row: number, col: number}>>}
   */
  async getAllBeansPositions() {
    const beans = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (await this.cellHasBean(row, col)) {
          beans.push({ row, col });
        }
      }
    }
    return beans;
  }

  /**
   * Place beans at multiple positions
   * @param {Array<{row: number, col: number}>} positions
   */
  async placeBeans(positions) {
    for (const { row, col } of positions) {
      await this.leftClickCell(row, col);
      await this.page.waitForTimeout(50); // Small delay between placements
    }
  }

  /**
   * Verify the game board is rendered correctly
   */
  async verifyBoardRendered() {
    // Should have 64 cells (8x8 grid)
    const cellCount = await this.page.locator('.cell').count();
    expect(cellCount).toBe(64);

    // Each cell should have a region class
    for (let i = 0; i < 64; i++) {
      const cell = this.page.locator('.cell').nth(i);
      const classes = await cell.getAttribute('class');
      expect(classes).toMatch(/region-\d/);
    }
  }

  /**
   * Count beans in a specific row
   * @param {number} row - Row index (0-7)
   * @returns {Promise<number>}
   */
  async countBeansInRow(row) {
    let count = 0;
    for (let col = 0; col < 8; col++) {
      if (await this.cellHasBean(row, col)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Count beans in a specific column
   * @param {number} col - Column index (0-7)
   * @returns {Promise<number>}
   */
  async countBeansInColumn(col) {
    let count = 0;
    for (let row = 0; row < 8; row++) {
      if (await this.cellHasBean(row, col)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Check if two beans are touching (including diagonally)
   * @param {{row: number, col: number}} bean1
   * @param {{row: number, col: number}} bean2
   * @returns {boolean}
   */
  areBeansTouching(bean1, bean2) {
    const rowDiff = Math.abs(bean1.row - bean2.row);
    const colDiff = Math.abs(bean1.col - bean2.col);
    return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
  }

  /**
   * Verify no beans are touching each other
   * @param {Array<{row: number, col: number}>} beans
   */
  async verifyNoTouchingBeans(beans) {
    for (let i = 0; i < beans.length; i++) {
      for (let j = i + 1; j < beans.length; j++) {
        const touching = this.areBeansTouching(beans[i], beans[j]);
        expect(touching).toBe(false);
      }
    }
  }
}

module.exports = { BeansGameHelpers };
