# Beans Game - End-to-End Testing

This directory contains comprehensive end-to-end tests for the Beans logic puzzle game using [Playwright](https://playwright.dev/).

## 📋 Test Coverage

The test suite covers:

### Core Gameplay (`gameplay.spec.js`)
- ✅ Board initialization and rendering
- ✅ Bean placement and removal (left-click)
- ✅ X marker placement and removal (right-click)
- ✅ Auto-fill X functionality
- ✅ Bean counter updates
- ✅ Timer functionality
- ✅ Colored region display
- ✅ Multiple bean interactions
- ✅ Rapid clicking handling

### Game Controls (`controls.spec.js`)
- ✅ New Game button functionality
- ✅ Check Solution validation
- ✅ Show Solution display
- ✅ Clear Board functionality
- ✅ Solution validation rules:
  - One bean per row
  - One bean per column
  - One bean per region
  - No touching beans (including diagonally)
- ✅ Success/error message display
- ✅ Game state management
- ✅ Timer behavior after solution

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

All dependencies are already installed if you're reading this! But if you need to reinstall:

```bash
npm install
```

This installs:
- `@playwright/test` - Testing framework
- `http-server` - Local web server for testing

### Installing Browsers

Playwright requires browser binaries. Install them with:

```bash
npx playwright install chromium
```

## 🧪 Running Tests

### Run all tests

```bash
npm test
```

### Run tests in headed mode (see browser)

```bash
npx playwright test --headed
```

### Run specific test file

```bash
npx playwright test gameplay.spec.js
npx playwright test controls.spec.js
```

### Run tests in debug mode

```bash
npx playwright test --debug
```

### Run tests with UI mode (recommended for development)

```bash
npx playwright test --ui
```

## 📊 Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

## 🗂️ Test Structure

```
tests/
├── helpers.js          # Reusable helper functions and utilities
├── gameplay.spec.js    # Core gameplay interaction tests
└── controls.spec.js    # Game controls and validation tests
```

### Helper Functions (`helpers.js`)

The `BeansGameHelpers` class provides convenient methods:

- `goto()` - Navigate to the game
- `getCell(row, col)` - Get a cell element
- `leftClickCell(row, col)` - Place/remove bean
- `rightClickCell(row, col)` - Place/remove X marker
- `cellHasBean(row, col)` - Check if cell has bean
- `cellHasX(row, col)` - Check if cell has X marker
- `getBeansPlacedCount()` - Get current bean count
- `clickNewGame()` - Click New Game button
- `clickCheckSolution()` - Click Check Solution button
- `clickShowSolution()` - Click Show Solution button
- `clickClearBoard()` - Click Clear Board button
- `getAllBeansPositions()` - Get all bean positions
- `placeBeans(positions)` - Place multiple beans
- And many more...

## 🔧 Configuration

Test configuration is in `playwright.config.js`:

- **Test Directory**: `./tests`
- **Base URL**: `http://localhost:8080`
- **Browser**: Chromium (Chrome/Edge)
- **Reports**: HTML format
- **Screenshots**: On failure only
- **Traces**: On first retry

The test server automatically starts before tests run and stops after completion.

## 📝 Writing New Tests

To add new tests:

1. Create a new `.spec.js` file in the `tests/` directory
2. Import the helpers:
   ```javascript
   const { test, expect } = require('@playwright/test');
   const { BeansGameHelpers } = require('./helpers');
   ```
3. Write your tests using the helper functions
4. Run with `npm test`

Example:
```javascript
test('my new test', async ({ page }) => {
  const helpers = new BeansGameHelpers(page);
  await helpers.goto();
  
  await helpers.leftClickCell(0, 0);
  expect(await helpers.cellHasBean(0, 0)).toBe(true);
});
```

## 🐛 Debugging Tests

### Visual debugging
```bash
npx playwright test --debug
```
This opens the Playwright Inspector for step-by-step execution.

### Headed mode
```bash
npx playwright test --headed
```
Watch the browser perform the tests.

### Screenshots
Screenshots are automatically captured on test failures in `test-results/`.

### Traces
View traces for failed tests:
```bash
npx playwright show-trace test-results/path-to-trace.zip
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

## ✅ Test Results

Run `npm test` to execute all tests. Expected output:

```
Running X tests using 1 worker

✓ [chromium] › gameplay.spec.js:XX:YY › should load and render the game board correctly
✓ [chromium] › gameplay.spec.js:XX:YY › should place a bean on left-click
✓ [chromium] › controls.spec.js:XX:YY › should reset board on New Game button click
...

XX passed (XXs)
```

## 🤝 Contributing

When adding new features to the game:
1. Write tests first (TDD approach)
2. Ensure all existing tests pass
3. Add new helper functions if needed
4. Update this README with new test coverage

## 📄 License

Tests are part of the Beans game project.
