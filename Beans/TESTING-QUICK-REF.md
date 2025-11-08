# End-to-End Testing - Quick Reference

## 🚀 Running Tests

```bash
npm test                    # Run all tests
npm run test:headed         # See browser
npm run test:ui            # Interactive mode
npm run test:debug         # Debug with inspector
npm run test:report        # View HTML report
```

## 📝 Test Files Created

```
Beans/
├── playwright.config.js          # Playwright configuration
├── package.json                  # Updated with test scripts
├── .gitignore                    # Ignores test artifacts
├── TESTING.md                    # Complete testing guide
└── tests/
    ├── README.md                 # Detailed documentation
    ├── helpers.js                # Test utilities (BeansGameHelpers)
    ├── gameplay.spec.js          # Core gameplay (25 tests)
    ├── controls.spec.js          # Controls & validation (18 tests)
    ├── edge-cases.spec.js        # Edge cases (15 tests)
    └── example.spec.js           # Example templates (8 tests)
```

## 🎯 Test Results

**✅ 65 tests passing**

- 25 Core gameplay tests
- 18 Game control tests  
- 15 Edge case tests
- 8 Example tests (7 active + 1 skipped)

## 📚 Common Helper Functions

```javascript
// Setup
const helpers = new BeansGameHelpers(page);
await helpers.goto();

// Cell interactions
await helpers.leftClickCell(row, col)
await helpers.rightClickCell(row, col)
await helpers.cellHasBean(row, col)
await helpers.cellHasX(row, col)

// Game controls
await helpers.clickNewGame()
await helpers.clickCheckSolution()
await helpers.clickShowSolution()
await helpers.clickClearBoard()
await helpers.setAutoFillX(true/false)

// Game state
await helpers.getBeansPlacedCount()
await helpers.getAllBeansPositions()
await helpers.placeBeans([{row, col}, ...])
await helpers.getMessageText()
await helpers.isMessageVisible()

// Validation
await helpers.verifyBoardRendered()
await helpers.verifyNoTouchingBeans(beans)
await helpers.countBeansInRow(row)
await helpers.countBeansInColumn(col)
```

## ✏️ Writing New Tests

```javascript
const { test, expect } = require('@playwright/test');
const { BeansGameHelpers } = require('./helpers');

test.describe('My Tests', () => {
  let helpers;

  test.beforeEach(async ({ page }) => {
    helpers = new BeansGameHelpers(page);
    await helpers.goto();
  });

  test('my test', async () => {
    await helpers.leftClickCell(0, 0);
    expect(await helpers.cellHasBean(0, 0)).toBe(true);
  });
});
```

## 🔍 Debugging Tests

```bash
# Run with visible browser
npm run test:headed

# Open Playwright Inspector
npm run test:debug

# Run specific test file
npx playwright test gameplay.spec.js

# Run tests matching pattern
npx playwright test --grep "should place bean"

# Update snapshots (if using visual regression)
npx playwright test --update-snapshots
```

## 📊 Coverage Areas

✅ Board generation & rendering  
✅ Bean placement/removal  
✅ X marker functionality  
✅ Auto-fill X markers  
✅ New Game generation  
✅ Solution validation (rows, columns, regions, touching)  
✅ Show Solution  
✅ Clear Board  
✅ Timer functionality  
✅ Error messages  
✅ Edge cases  
✅ Accessibility

## 🛠️ Useful Playwright Commands

```javascript
// Locators
page.locator('#id')
page.locator('.class')
page.locator('button:has-text("Click me")')

// Actions
await element.click()
await element.click({ button: 'right' })
await element.fill('text')
await element.type('text', { delay: 100 })

// Assertions
await expect(element).toBeVisible()
await expect(element).toHaveText('text')
await expect(element).toHaveAttribute('class', 'value')
await expect(page).toHaveTitle('title')

// Waiting
await page.waitForTimeout(1000)
await page.waitForSelector('.element')
await page.waitForLoadState('networkidle')
```

## 📖 Documentation

- `TESTING.md` - Complete testing overview
- `tests/README.md` - Detailed testing guide
- `tests/example.spec.js` - Example test templates

## 💡 Tips

1. **Use helpers** - Don't interact with DOM directly
2. **Disable auto-fill** when needed for predictable behavior
3. **Wait appropriately** - Use `page.waitForTimeout()` for animations
4. **Test one thing** - Keep tests focused
5. **Use descriptive names** - Make test purposes clear
6. **Check screenshots** on failure in `test-results/`

---

**Happy Testing! 🎉**
