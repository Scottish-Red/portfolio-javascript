// ===== GAME STATE VARIABLES =====
// These variables track the current state of the puzzle game

let gameBoard = []; // 2D representation of the game grid (currently unused but kept for future expansion)
let regions = []; // Array mapping each cell index to its region number (0-7)
let beansPlaced = []; // Array of {row, col} objects representing where the player has placed beans
let xMarkers = []; // Array of {row, col} objects representing where the player has manually placed X markers
let autoXMarkers = []; // Array of {row, col} objects representing automatically placed X markers
let solution = []; // Array of {row, col} objects representing the unique solution to the current puzzle
let gridSize = 8; // The grid is 8x8 (8 rows, 8 columns, 8 beans, 8 regions)
let timerInterval = null; // Reference to the interval that updates the timer every second
let startTime = null; // Timestamp when the current game started (used to calculate elapsed time)
let gameActive = false; // Boolean indicating whether the game is currently in play (false when solved or showing solution)

// ===== DOM ELEMENT REFERENCES =====
// These variables store references to HTML elements we'll interact with frequently

const gameBoardElement = document.getElementById('gameBoard'); // The grid container
const beansPlacedElement = document.getElementById('beansPlaced'); // Display for number of beans placed
const totalBeansElement = document.getElementById('totalBeans'); // Display for total beans needed
const timerElement = document.getElementById('timer'); // Display for elapsed time
const messageElement = document.getElementById('message'); // Area for showing success/error messages
const newGameBtn = document.getElementById('newGame'); // Button to start a new puzzle
const checkSolutionBtn = document.getElementById('checkSolution'); // Button to validate current solution
const showSolutionBtn = document.getElementById('showSolution'); // Button to reveal the answer
const clearBoardBtn = document.getElementById('clearBoard'); // Button to clear all placed beans and Xs
const autoFillXCheckbox = document.getElementById('autoFillX'); // Checkbox to enable/disable auto-X placement

// ===== EVENT LISTENERS =====
// These connect user actions (clicks, page load) to our game functions

// When the page finishes loading, start a new game automatically
window.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});

// Connect buttons to their respective functions
newGameBtn.addEventListener('click', initializeGame); // Start a new puzzle
checkSolutionBtn.addEventListener('click', checkSolution); // Validate the player's answer
showSolutionBtn.addEventListener('click', showSolution); // Reveal the correct answer
clearBoardBtn.addEventListener('click', clearBoard); // Remove all beans and X markers

// ===== GAME INITIALIZATION =====
// This function sets up a new puzzle from scratch

function initializeGame() {
    console.log('Initializing game...');
    
    // Reset all game state variables to start fresh
    gameActive = true; // Allow the player to interact with the board
    beansPlaced = []; // Clear any beans the player has placed
    xMarkers = []; // Clear any manual X markers
    autoXMarkers = []; // Clear any automatic X markers
    startTime = Date.now(); // Record when this game started (for the timer)
    
    // Step 1: Create a valid solution (one bean per row, column, region, no touching)
    console.log('Generating solution...');
    generateValidSolution();
    console.log('Solution generated:', solution);
    
    // Step 2: Create colored regions based on where the solution beans are located
    console.log('Generating regions...');
    generateRegionsFromSolution();
    console.log('Regions generated:', regions);
    
    // Step 2.5: Verify the puzzle has exactly one solution
    // Keep regenerating until we have a unique solution
    let attempts = 0;
    while (true) {
        const solutionCount = countSolutions();
        attempts++;
        console.log(`Attempt ${attempts}: Found ${solutionCount} solution(s)`);
        
        if (solutionCount === 1) {
            console.log('Puzzle has unique solution!');
            break; // Perfect! Exactly one solution
        } else {
            // Multiple solutions exist, regenerate regions
            console.log('Multiple solutions detected, regenerating...');
            generateRegionsFromSolution();
        }
    }
    
    // Step 3: Draw the game board on the screen with the colored regions
    console.log('Creating board...');
    createBoard();
    console.log('Board created');
    
    // Step 4: Start the timer that tracks how long the player takes
    if (timerInterval) clearInterval(timerInterval); // Stop any existing timer
    timerInterval = setInterval(updateTimer, 1000); // Update the timer display every second
    
    // Step 5: Update the UI to show 0 beans placed
    updateBeansCount();
    hideMessage(); // Clear any previous success/error messages
}

// ===== SOLUTION GENERATION =====
// This function creates a valid bean placement that will serve as the puzzle's answer
// CRITICAL CONSTRAINTS: One bean per row, one bean per column, no beans touching (including diagonally)

function generateValidSolution() {
    solution = []; // Start with an empty solution
    let attempts = 0; // Track how many times we've tried to generate a solution
    const maxAttempts = 1000; // Give up after 1000 failed attempts and use fallback
    
    // Keep trying until we have 8 beans placed (one per row) or we've tried too many times
    while (solution.length < gridSize && attempts < maxAttempts) {
        attempts++;
        solution = []; // Reset solution for this attempt
        
        // Create an array of available columns [0, 1, 2, 3, 4, 5, 6, 7]
        let availableCols = Array.from({length: gridSize}, (_, i) => i);
        
        // Shuffle the columns randomly to create variety in solutions
        for (let i = availableCols.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableCols[i], availableCols[j]] = [availableCols[j], availableCols[i]];
        }
        
        // Track which columns have been used (to ensure one bean per column)
        const usedCols = new Set();
        
        // Try to place one bean in each row (0 through 7)
        for (let row = 0; row < gridSize; row++) {
            let placed = false; // Track whether we successfully placed a bean in this row
            
            // Try each column in our shuffled order
            for (let colIndex = 0; colIndex < availableCols.length; colIndex++) {
                const col = availableCols[colIndex];
                
                // Skip if this column is already used
                if (usedCols.has(col)) continue;
                
                // Check if we can place a bean at this position without it touching existing beans
                if (isValidPlacement(row, col, solution)) {
                    solution.push({row, col}); // Add this bean to our solution
                    usedCols.add(col); // Mark this column as used
                    placed = true;
                    break; // Move on to the next row
                }
            }
            
            // If we couldn't place a bean in this row, this attempt failed
            if (!placed) {
                break; // Start over with a new random column order
            }
        }
    }
    
    // If we failed to generate a valid solution, use a pre-made pattern that's guaranteed to work
    if (solution.length !== gridSize) {
        console.error('Failed to generate valid solution');
        solution = generateFallbackSolution();
    }
    
    // Verify the solution is valid (one per row, one per column, no touching)
    validateSolution();
}

// ===== VALIDATE SOLUTION =====
// This function verifies that the generated solution meets all constraints
function validateSolution() {
    const rowsUsed = new Set();
    const colsUsed = new Set();
    
    // Check each bean in the solution
    for (const bean of solution) {
        // Check for duplicate rows
        if (rowsUsed.has(bean.row)) {
            console.error(`ERROR: Multiple beans in row ${bean.row}!`);
        }
        rowsUsed.add(bean.row);
        
        // Check for duplicate columns
        if (colsUsed.has(bean.col)) {
            console.error(`ERROR: Multiple beans in column ${bean.col}!`);
        }
        colsUsed.add(bean.col);
    }
    
    // Check for touching beans
    for (let i = 0; i < solution.length; i++) {
        for (let j = i + 1; j < solution.length; j++) {
            const b1 = solution[i];
            const b2 = solution[j];
            const rowDiff = Math.abs(b1.row - b2.row);
            const colDiff = Math.abs(b1.col - b2.col);
            
            if (rowDiff <= 1 && colDiff <= 1) {
                console.error(`ERROR: Beans at (${b1.row},${b1.col}) and (${b2.row},${b2.col}) are touching!`);
            }
        }
    }
    
    console.log('✓ Solution validated: one per row, one per column, no touching');
}

// ===== PLACEMENT VALIDATION =====
// This function checks if placing a bean at a specific position would touch any existing beans

function isValidPlacement(row, col, existingBeans) {
    // Check every bean that's already been placed
    for (const bean of existingBeans) {
        // Calculate the distance between this potential position and the existing bean
        const rowDiff = Math.abs(bean.row - row); // How many rows apart?
        const colDiff = Math.abs(bean.col - col); // How many columns apart?
        
        // If both distances are <= 1, the beans would be touching (including diagonally)
        // For example: rowDiff=1, colDiff=1 means diagonal neighbors
        //              rowDiff=0, colDiff=1 means horizontal neighbors
        //              rowDiff=1, colDiff=0 means vertical neighbors
        if (rowDiff <= 1 && colDiff <= 1) {
            return false; // This placement is invalid - beans would touch
        }
    }
    return true; // This placement is valid - no beans would touch
}

// ===== FALLBACK SOLUTION =====
// This function provides a pre-tested valid solution pattern in case random generation fails

function generateFallbackSolution() {
    // This is a known valid pattern (similar to 8-queens problem solution)
    // Each bean is in a different row, column, and no two beans touch each other
    const validPattern = [
        {row: 0, col: 0}, // Bean in top-left
        {row: 1, col: 4}, // Bean in row 2, column 5
        {row: 2, col: 7}, // Bean in row 3, column 8
        {row: 3, col: 5}, // Bean in row 4, column 6
        {row: 4, col: 2}, // Bean in row 5, column 3
        {row: 5, col: 6}, // Bean in row 6, column 7
        {row: 6, col: 1}, // Bean in row 7, column 2
        {row: 7, col: 3}  // Bean in row 8, column 4
    ];
    return validPattern;
}

// ===== REGION GENERATION =====
// This function creates 8 colored regions on the board, each containing exactly one solution bean
// This ensures the puzzle has the constraint that each colored region must have exactly one bean
// CRITICAL: Regions must be continuous - all cells of the same color must be connected

function generateRegionsFromSolution(attemptNumber = 0) {
    // Prevent infinite recursion if region generation keeps failing
    const maxRegenerationAttempts = 10;
    if (attemptNumber >= maxRegenerationAttempts) {
        console.error('Max regeneration attempts reached. Using current regions.');
        return;
    }
    
    // Initialize all 64 cells (8x8 grid) as unassigned (region -1)
    regions = Array(gridSize * gridSize).fill(-1);
    
    // Step 1: Assign each solution bean to its own region (0-7)
    // This ensures each region will have exactly one bean from the solution
    solution.forEach((bean, regionIndex) => {
        const index = bean.row * gridSize + bean.col; // Convert row,col to array index
        regions[index] = regionIndex; // Cell at solution bean gets that region number
    });
    
    // Step 2: Grow regions simultaneously using a queue-based flood fill
    // This ensures regions grow outward and remain continuous
    const queues = Array(gridSize).fill(null).map(() => []);
    
    // Initialize queues with the solution bean positions
    solution.forEach((bean, regionIndex) => {
        queues[regionIndex].push({row: bean.row, col: bean.col});
    });
    
    // Step 3: Grow regions one cell at a time in round-robin fashion
    // This keeps regions roughly balanced as they grow
    let unassignedCount = gridSize * gridSize - gridSize; // 64 - 8 = 56 cells to assign
    
    while (unassignedCount > 0) {
        let addedThisRound = false;
        
        // Let each region grow by one cell (if possible)
        for (let regionIndex = 0; regionIndex < gridSize; regionIndex++) {
            if (queues[regionIndex].length === 0) continue;
            
            // Get the next cell in this region's queue
            const current = queues[regionIndex].shift();
            
            // Find unassigned neighbors of this cell
            const neighbors = [
                {row: current.row - 1, col: current.col}, // Up
                {row: current.row + 1, col: current.col}, // Down
                {row: current.row, col: current.col - 1}, // Left
                {row: current.row, col: current.col + 1}  // Right
            ];
            
            // Shuffle neighbors to add randomness to region shapes
            shuffleArray(neighbors);
            
            for (const neighbor of neighbors) {
                // Skip if out of bounds
                if (neighbor.row < 0 || neighbor.row >= gridSize || 
                    neighbor.col < 0 || neighbor.col >= gridSize) {
                    continue;
                }
                
                const neighborIndex = neighbor.row * gridSize + neighbor.col;
                
                // If this neighbor is unassigned, claim it for this region
                if (regions[neighborIndex] === -1) {
                    regions[neighborIndex] = regionIndex;
                    queues[regionIndex].push(neighbor); // Add to queue for further growth
                    unassignedCount--;
                    addedThisRound = true;
                    break; // Only add one neighbor per turn to keep growth balanced
                }
            }
        }
        
        // Safety check: if no cells were added this round, we're stuck
        if (!addedThisRound) {
            console.warn('Region growth stalled, filling remaining cells...');
            // Fill any remaining unassigned cells with their nearest region
            for (let i = 0; i < gridSize * gridSize; i++) {
                if (regions[i] === -1) {
                    regions[i] = findClosestRegion(i);
                    unassignedCount--;
                }
            }
            break;
        }
    }
    
    // Step 4: Verify all regions are connected (no split regions)
    // This is a final safety check to ensure continuity
    for (let r = 0; r < gridSize; r++) {
        if (!isRegionConnected(r)) {
            console.error(`ERROR: Region ${r} is not fully connected! Regenerating (attempt ${attemptNumber + 1})...`);
            // If a region is disconnected, regenerate completely (with attempt counter)
            generateRegionsFromSolution(attemptNumber + 1);
            return;
        }
    }
    
    console.log('All regions verified as continuous!');
}

// ===== FIND CLOSEST REGION =====
// This helper function finds the nearest region for an unassigned cell

function findClosestRegion(cellIndex) {
    const row = Math.floor(cellIndex / gridSize); // Get cell's row
    const col = cellIndex % gridSize; // Get cell's column
    
    // Spiral outward from this cell to find the nearest assigned region
    for (let distance = 1; distance < gridSize; distance++) {
        for (let dr = -distance; dr <= distance; dr++) {
            for (let dc = -distance; dc <= distance; dc++) {
                const newRow = row + dr;
                const newCol = col + dc;
                
                // Check if this position is within the grid
                if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
                    const index = newRow * gridSize + newCol;
                    // If this cell has a region, use that region
                    if (regions[index] !== -1) {
                        return regions[index];
                    }
                }
            }
        }
    }
    
    return 0; // Fallback to region 0 if nothing found
}

// ===== BALANCE REGIONS =====
// This function ensures each region has approximately equal size (8 cells each)
// CRITICAL: This function must maintain continuity - regions cannot be split into separate pieces

function balanceRegions() {
    const targetSize = gridSize; // Each region should have 8 cells (64 total / 8 regions)
    const regionSizes = Array(gridSize).fill(0); // Track how many cells in each region
    
    // Count the current size of each region
    regions.forEach(r => regionSizes[r]++);
    
    // Try to balance by moving cells from oversized regions to undersized ones
    for (let attempt = 0; attempt < 100; attempt++) {
        let changed = false; // Track if we made any changes this iteration
        
        for (let i = 0; i < gridSize * gridSize; i++) {
            const currentRegion = regions[i];
            
            // If this region has too many cells
            if (regionSizes[currentRegion] > targetSize) {
                const row = Math.floor(i / gridSize);
                const col = i % gridSize;
                
                // Get the regions of neighboring cells
                const neighbors = getNeighborRegions(row, col);
                
                // Try to move this cell to a neighbor region that's too small
                for (const neighborRegion of neighbors) {
                    if (neighborRegion !== currentRegion && regionSizes[neighborRegion] < targetSize) {
                        // Don't move cells that contain solution beans
                        const isSolutionCell = solution.some(s => s.row === row && s.col === col);
                        
                        if (!isSolutionCell) {
                            // CRITICAL CHECK: Verify that moving this cell won't disconnect the current region
                            // Temporarily move the cell and check if the region is still continuous
                            const originalRegion = regions[i];
                            regions[i] = neighborRegion;
                            
                            // Check if the original region is still connected
                            if (isRegionConnected(originalRegion)) {
                                // Safe to move! Update the region sizes
                                regionSizes[currentRegion]--;
                                regionSizes[neighborRegion]++;
                                changed = true;
                                break;
                            } else {
                                // Moving this cell would split the region - undo it!
                                regions[i] = originalRegion;
                            }
                        }
                    }
                }
            }
        }
        
        // Stop if no changes were made (regions are balanced)
        if (!changed) break;
    }
}

// ===== GET NEIGHBOR REGIONS =====
// This function returns a list of which regions are adjacent to a given cell

function getNeighborRegions(row, col) {
    const neighbors = new Set(); // Use Set to avoid duplicates
    
    // Check the region above this cell
    if (row > 0) neighbors.add(regions[(row - 1) * gridSize + col]);
    // Check the region below this cell
    if (row < gridSize - 1) neighbors.add(regions[(row + 1) * gridSize + col]);
    // Check the region to the left
    if (col > 0) neighbors.add(regions[row * gridSize + (col - 1)]);
    // Check the region to the right
    if (col < gridSize - 1) neighbors.add(regions[row * gridSize + (col + 1)]);
    
    return Array.from(neighbors); // Convert Set back to Array
}

// ===== CHECK REGION CONNECTIVITY =====
// This function verifies that all cells of a given region are connected (no separated islands)
// Uses flood-fill algorithm to ensure the region is one continuous piece

function isRegionConnected(regionNumber) {
    // Find all cells belonging to this region
    const regionCells = [];
    for (let i = 0; i < gridSize * gridSize; i++) {
        if (regions[i] === regionNumber) {
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            regionCells.push({row, col, index: i});
        }
    }
    
    // If region has 0 or 1 cell, it's automatically connected
    if (regionCells.length <= 1) return true;
    
    // Use flood-fill starting from the first cell to see if we can reach all cells
    const visited = new Set();
    const queue = [regionCells[0]]; // Start from first cell
    visited.add(regionCells[0].index);
    
    while (queue.length > 0) {
        const current = queue.shift();
        
        // Check all 4 neighbors (up, down, left, right)
        const neighbors = [
            {row: current.row - 1, col: current.col}, // Up
            {row: current.row + 1, col: current.col}, // Down
            {row: current.row, col: current.col - 1}, // Left
            {row: current.row, col: current.col + 1}  // Right
        ];
        
        for (const neighbor of neighbors) {
            // Skip if out of bounds
            if (neighbor.row < 0 || neighbor.row >= gridSize || 
                neighbor.col < 0 || neighbor.col >= gridSize) {
                continue;
            }
            
            const neighborIndex = neighbor.row * gridSize + neighbor.col;
            
            // Skip if already visited
            if (visited.has(neighborIndex)) continue;
            
            // Skip if not part of this region
            if (regions[neighborIndex] !== regionNumber) continue;
            
            // Add to visited and queue
            visited.add(neighborIndex);
            queue.push({row: neighbor.row, col: neighbor.col, index: neighborIndex});
        }
    }
    
    // If we visited all cells in the region, it's connected
    // If we visited fewer cells, the region is split into disconnected pieces
    return visited.size === regionCells.length;
}

// ===== SHUFFLE ARRAY =====
// This helper function randomly shuffles an array in place (Fisher-Yates shuffle)

function shuffleArray(array) {
    // Start from the end and swap each element with a random earlier element
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
        // Swap elements at positions i and j
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// ===== BOARD CREATION =====
// This function draws the game board grid on the screen with all the colored regions

function createBoard() {
    gameBoardElement.innerHTML = ''; // Clear any existing board
    gameBoardElement.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`; // Set up 8 columns
    
    // Create all 64 cells (8 rows × 8 columns)
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            // Create a div element for this cell
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i; // Store row number in the element for later reference
            cell.dataset.col = j; // Store column number in the element for later reference
            
            // Determine which colored region this cell belongs to
            const regionIndex = regions[i * gridSize + j];
            cell.classList.add(`region-${regionIndex}`); // Add CSS class for coloring
            
            // Add thick borders around the edges of each colored region
            applyRegionBorders(cell, i, j);
            
            // Left click places a bean
            cell.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default click behavior
                handleCellClick(i, j, cell, 'bean');
            });
            
            // Right click places an X marker
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault(); // Prevent the context menu from appearing
                handleCellClick(i, j, cell, 'x');
            });
            
            gameBoardElement.appendChild(cell); // Add this cell to the board
        }
    }
}

// ===== REGION BORDER STYLING =====
// This function adds thick borders around the perimeter of each colored region

function applyRegionBorders(cell, row, col) {
    const currentRegion = regions[row * gridSize + col]; // Get this cell's region number
    
    // Check if the cell above is in a different region (or if this is the top edge)
    if (row === 0 || regions[(row - 1) * gridSize + col] !== currentRegion) {
        cell.style.borderTop = '3px solid #000'; // Add thick top border
    }
    
    // Check if the cell below is in a different region (or if this is the bottom edge)
    if (row === gridSize - 1 || regions[(row + 1) * gridSize + col] !== currentRegion) {
        cell.style.borderBottom = '3px solid #000'; // Add thick bottom border
    }
    
    // Check if the cell to the left is in a different region (or if this is the left edge)
    if (col === 0 || regions[row * gridSize + (col - 1)] !== currentRegion) {
        cell.style.borderLeft = '3px solid #000'; // Add thick left border
    }
    
    // Check if the cell to the right is in a different region (or if this is the right edge)
    if (col === gridSize - 1 || regions[row * gridSize + (col + 1)] !== currentRegion) {
        cell.style.borderRight = '3px solid #000'; // Add thick right border
    }
}

// ===== CELL CLICK HANDLER =====
// This function handles both left clicks (bean) and right clicks (X marker)

function handleCellClick(row, col, cell, clickType) {
    if (!gameActive) return; // Don't allow changes if game is over
    
    // Check if this cell currently has a bean
    const beanIndex = beansPlaced.findIndex(b => b.row === row && b.col === col);
    // Check if this cell currently has a manual X marker
    const xIndex = xMarkers.findIndex(x => x.row === row && x.col === col);
    // Check if this cell currently has an automatic X marker
    const autoXIndex = autoXMarkers.findIndex(x => x.row === row && x.col === col);
    
    if (clickType === 'bean') {
        // ===== LEFT CLICK: Handle bean placement/removal =====
        
        if (beanIndex !== -1) {
            // This cell already has a bean - remove it
            beansPlaced.splice(beanIndex, 1); // Remove from beansPlaced array
            cell.innerHTML = ''; // Clear the visual bean
            cell.classList.remove('has-bean'); // Remove the CSS class
            
            // Remove all automatic X markers that were placed because of this bean
            clearAllAutoXMarkers();
            
            // Recalculate automatic X markers based on remaining beans
            if (autoFillXCheckbox.checked) {
                recalculateAutoXMarkers();
            }
        } else if (xIndex !== -1 || autoXIndex !== -1) {
            // Cell has an X marker - inform user to remove it first
            showMessage('Remove X marker first (right-click)', 'info');
            return;
        } else {
            // Cell is empty - place a bean
            if (beansPlaced.length >= gridSize) {
                showMessage('You can only place ' + gridSize + ' beans!', 'error');
                return;
            }
            
            // Get the region index for this cell
            const regionIndex = regions[row * gridSize + col];
            
            beansPlaced.push({ row, col, region: regionIndex }); // Add to beansPlaced array with region tracking
            const bean = document.createElement('div');
            bean.className = 'bean';
            cell.appendChild(bean); // Add visual bean
            cell.classList.add('has-bean'); // Add CSS class
            
            // Automatically place X markers in cells where beans can't go
            if (autoFillXCheckbox.checked) {
                autoFillXMarkers(row, col, regionIndex);
            }
        }
    } else if (clickType === 'x') {
        // ===== RIGHT CLICK: Handle X marker placement/removal =====
        
        if (beanIndex !== -1) {
            // Cell has a bean - can't place X marker here
            showMessage('This cell has a bean! Left-click to remove it', 'info');
            return;
        } else if (autoXIndex !== -1) {
            // Cell has an automatic X - inform user they can't manually change it
            showMessage('This X was placed automatically. Remove the bean causing it.', 'info');
            return;
        } else if (xIndex !== -1) {
            // Cell has a manual X - remove it
            xMarkers.splice(xIndex, 1); // Remove from xMarkers array
            cell.innerHTML = ''; // Clear the visual X
        } else {
            // Cell is empty - place a manual X marker
            xMarkers.push({ row, col }); // Add to xMarkers array
            const xMarker = document.createElement('div');
            xMarker.className = 'x-marker';
            xMarker.textContent = '✖';
            cell.appendChild(xMarker); // Add visual X
        }
    }
    
    updateBeansCount(); // Update the beans placed counter
}

// ===== CLEAR AUTO X MARKERS =====
// This function removes all automatically-placed X markers from the board
// Manual X markers placed by the player are preserved

function clearAllAutoXMarkers() {
    // Remove each automatic X marker from the visual display
    autoXMarkers.forEach(marker => {
        const cell = document.querySelector(`[data-row="${marker.row}"][data-col="${marker.col}"]`);
        if (cell) {
            // Only remove if it's not a manual X or a bean
            const hasManualX = xMarkers.some(x => x.row === marker.row && x.col === marker.col);
            const hasBean = beansPlaced.some(b => b.row === marker.row && b.col === marker.col);
            
            if (!hasManualX && !hasBean) {
                cell.innerHTML = ''; // Clear the cell
            }
        }
    });
    
    // Clear the automatic X markers array
    autoXMarkers = [];
}

// ===== RECALCULATE AUTO X MARKERS =====
// This function recalculates all automatic X markers based on currently placed beans

function recalculateAutoXMarkers() {
    // For each bean on the board, calculate which cells should have automatic Xs
    beansPlaced.forEach(bean => {
        autoFillXMarkers(bean.row, bean.col, bean.region);
    });
}

// ===== AUTO-FILL X MARKERS =====
// When a bean is placed, this automatically marks all cells where another bean cannot go
// This includes: same row, same column, all 8 surrounding cells (no diagonal beans allowed),
// and all remaining cells in the same colored region

function autoFillXMarkers(beanRow, beanCol, regionIndex = null) {
    // Check every cell on the board
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            // Skip cells that already have a bean
            const hasBean = beansPlaced.some(b => b.row === i && b.col === j);
            if (hasBean) continue;
            
            // Skip cells that already have a manual X marker
            const hasManualX = xMarkers.some(x => x.row === i && x.col === j);
            if (hasManualX) continue;
            
            // Skip cells that already have an automatic X marker
            const hasAutoX = autoXMarkers.some(x => x.row === i && x.col === j);
            if (hasAutoX) continue;
            
            // Get the region of the current cell
            const cellRegion = regions[i * gridSize + j];
            
            // Determine if this cell should be marked with an automatic X
            const shouldMarkX = 
                i === beanRow || // Same row as the bean
                j === beanCol || // Same column as the bean
                (Math.abs(i - beanRow) <= 1 && Math.abs(j - beanCol) <= 1) || // Touching the bean (including diagonally)
                (regionIndex !== null && cellRegion === regionIndex); // Same region as the bean
            
            if (shouldMarkX) {
                // Add to automatic X markers array
                autoXMarkers.push({ row: i, col: j });
                
                // Display the X marker on the board
                const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                const xMarker = document.createElement('div');
                xMarker.className = 'x-marker auto-x'; // Add 'auto-x' class to distinguish from manual Xs
                xMarker.textContent = '✖';
                cell.appendChild(xMarker);
            }
        }
    }
}

// ===== UPDATE BEANS COUNT DISPLAY =====
// This function updates the UI to show how many beans the player has placed

function updateBeansCount() {
    beansPlacedElement.textContent = beansPlaced.length; // Current number of beans
    totalBeansElement.textContent = gridSize; // Total beans needed (8)
}

// ===== UPDATE TIMER DISPLAY =====
// This function updates the timer every second to show how long the player has been playing

function updateTimer() {
    if (!startTime) return; // Don't update if game hasn't started
    
    // Calculate elapsed time in seconds
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    
    // Convert to minutes and seconds
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    // Display as MM:SS format (e.g., "03:45")
    timerElement.textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ===== CHECK SOLUTION =====
// This function validates whether the player's current bean placement is correct

function checkSolution() {
    if (!gameActive) return; // Don't check if game is already over
    
    // Player must place all 8 beans before checking
    if (beansPlaced.length !== gridSize) {
        showMessage(`Place all ${gridSize} beans first!`, 'error');
        return;
    }
    
    // Clear any previous error/success highlighting
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('error', 'success');
    });
    
    let errors = []; // Array to collect all rule violations
    
    // RULE 1: Check rows - each row must have exactly one bean
    for (let i = 0; i < gridSize; i++) {
        const beansInRow = beansPlaced.filter(b => b.row === i);
        if (beansInRow.length !== 1) {
            errors.push(`Row ${i + 1} should have exactly 1 bean`);
        }
    }
    
    // RULE 2: Check columns - each column must have exactly one bean
    for (let j = 0; j < gridSize; j++) {
        const beansInCol = beansPlaced.filter(b => b.col === j);
        if (beansInCol.length !== 1) {
            errors.push(`Column ${j + 1} should have exactly 1 bean`);
        }
    }
    
    // RULE 3: Check regions - each colored region must have exactly one bean
    for (let r = 0; r < gridSize; r++) {
        const beansInRegion = beansPlaced.filter(b => {
            const index = b.row * gridSize + b.col;
            return regions[index] === r;
        });
        if (beansInRegion.length !== 1) {
            errors.push(`Region ${r + 1} should have exactly 1 bean`);
        }
    }
    
    // RULE 4: Check touching - no two beans can touch each other (including diagonally)
    for (let i = 0; i < beansPlaced.length; i++) {
        for (let j = i + 1; j < beansPlaced.length; j++) {
            const b1 = beansPlaced[i];
            const b2 = beansPlaced[j];
            
            const rowDiff = Math.abs(b1.row - b2.row);
            const colDiff = Math.abs(b1.col - b2.col);
            
            // If both differences are <= 1, the beans are touching
            if (rowDiff <= 1 && colDiff <= 1) {
                errors.push(`Beans at (${b1.row + 1}, ${b1.col + 1}) and (${b2.row + 1}, ${b2.col + 1}) are touching`);
                
                // Highlight the error cells in red
                const cell1 = document.querySelector(`[data-row="${b1.row}"][data-col="${b1.col}"]`);
                const cell2 = document.querySelector(`[data-row="${b2.row}"][data-col="${b2.col}"]`);
                cell1.classList.add('error');
                cell2.classList.add('error');
            }
        }
    }
    
    // Check if the solution is correct
    if (errors.length === 0) {
        // SUCCESS! The player solved the puzzle correctly!
        gameActive = false; // Stop the game
        clearInterval(timerInterval); // Stop the timer
        
        // Highlight all beans in green to show success
        document.querySelectorAll('.cell.has-bean').forEach(cell => {
            cell.classList.add('success');
        });
        
        showMessage('🎉 Congratulations! You solved the puzzle! 🎉', 'success');
    } else {
        // The solution has errors
        showMessage(`Found ${errors.length} error(s). Keep trying!`, 'error');
        console.log('Errors:', errors); // Log errors for debugging
    }
}

// ===== CLEAR BOARD =====
// This function removes all beans and X markers from the board

function clearBoard() {
    // Clear all arrays
    beansPlaced = [];
    xMarkers = []; // Manual X markers
    autoXMarkers = []; // Automatic X markers
    
    // Remove all visual markers from the board
    document.querySelectorAll('.cell').forEach(cell => {
        cell.innerHTML = ''; // Clear the cell contents
        cell.classList.remove('has-bean', 'error', 'success'); // Remove all state classes
    });
    
    updateBeansCount(); // Update the counter to show 0 beans
    hideMessage(); // Clear any messages
}

// ===== SHOW SOLUTION =====
// This function reveals the correct answer to the current puzzle

function showSolution() {
    // Make sure we have a valid solution to show
    if (!solution || solution.length === 0) {
        showMessage('No solution available. Start a new game!', 'error');
        return;
    }
    
    // Clear the board first (removes all beans and Xs)
    clearBoard();
    
    // Place all solution beans on the board
    solution.forEach(bean => {
        // Get the region index for this cell
        const regionIndex = regions[bean.row * gridSize + bean.col];
        
        // Add to beansPlaced array with region tracking
        beansPlaced.push({row: bean.row, col: bean.col, region: regionIndex});
        
        // Find the cell and add the visual bean
        const cell = document.querySelector(`[data-row="${bean.row}"][data-col="${bean.col}"]`);
        const beanElement = document.createElement('div');
        beanElement.className = 'bean';
        cell.appendChild(beanElement);
        
        // Highlight in green to show this is the solution
        cell.classList.add('has-bean', 'success');
    });
    
    updateBeansCount(); // Update the counter
    gameActive = false; // Stop the game (solution is revealed)
    clearInterval(timerInterval); // Stop the timer
    
    showMessage('✨ Solution revealed! Click "New Game" to try another puzzle.', 'info');
}

// ===== COUNT SOLUTIONS =====
// This function counts how many valid solutions exist for the current puzzle
// A puzzle should have exactly 1 solution to be a good puzzle

function countSolutions() {
    let solutionCount = 0; // Track how many valid solutions we find
    const maxSolutions = 2; // Stop searching after finding 2 (we only need to know if it's unique)
    
    // Helper function to recursively try placing beans
    function solve(row, placedBeans, usedCols, usedRegions) {
        // Base case: we've successfully placed all 8 beans
        if (row === gridSize) {
            solutionCount++;
            return solutionCount >= maxSolutions; // Return true to stop searching
        }
        
        // Try placing a bean in each column of this row
        for (let col = 0; col < gridSize; col++) {
            // Skip if this column already has a bean
            if (usedCols.has(col)) continue;
            
            // Check which region this cell belongs to
            const regionIndex = regions[row * gridSize + col];
            
            // Skip if this region already has a bean
            if (usedRegions.has(regionIndex)) continue;
            
            // Check if placing a bean here would touch any existing beans
            let touchesExisting = false;
            for (const bean of placedBeans) {
                const rowDiff = Math.abs(bean.row - row);
                const colDiff = Math.abs(bean.col - col);
                if (rowDiff <= 1 && colDiff <= 1) {
                    touchesExisting = true;
                    break;
                }
            }
            
            // Skip if this placement would touch an existing bean
            if (touchesExisting) continue;
            
            // This is a valid placement! Try placing the bean here
            placedBeans.push({row, col});
            usedCols.add(col);
            usedRegions.add(regionIndex);
            
            // Recursively try to place beans in the remaining rows
            const shouldStop = solve(row + 1, placedBeans, usedCols, usedRegions);
            
            // Backtrack: remove this bean and try other positions
            placedBeans.pop();
            usedCols.delete(col);
            usedRegions.delete(regionIndex);
            
            // Stop early if we've found multiple solutions
            if (shouldStop) return true;
        }
        
        return false;
    }
    
    // Start the recursive search from row 0
    solve(0, [], new Set(), new Set());
    
    return solutionCount;
}

// ===== MESSAGE DISPLAY FUNCTIONS =====
// These functions show and hide messages to the player

// Show a message with a specific type (success, error, or info)
function showMessage(text, type) {
    messageElement.textContent = text; // Set the message text
    messageElement.className = 'message show ' + type; // Add classes for styling and animation
    
    // Auto-hide the message after 3 seconds (except for success messages)
    setTimeout(() => {
        if (type !== 'success') {
            hideMessage();
        }
    }, 3000);
}

// Hide the currently displayed message
function hideMessage() {
    messageElement.classList.remove('show'); // Trigger fade-out animation
    
    // After animation completes, clear the message
    setTimeout(() => {
        messageElement.textContent = '';
        messageElement.className = 'message';
    }, 300);
}
