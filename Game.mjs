import { createSeededRandom, uuidv4, withFrameDelay } from "./utils.mjs";

const seedField = document.getElementById("seed-field");
const grid = document.getElementById("gridContainer");
const probabilityField = document.getElementById("probability-field");
const startButton = document.getElementById("start-button");
const randomizeButton = document.getElementById("randomize-button");
const resetButton = document.getElementById("reset-button");
const generation = document.getElementById("generation");
// when modifying these two values, don't forget to update css class for gridContainer
const columnSize = 100;
const rowSize = 100;

let currentGeneration = 0;
let continueUpdating = false;

let gridCellIds = [];

let cellNeighborMap = {};

function birthCell(cell) {
  cell.classList.add("alive");
  cell.setAttribute("data-alive", "true");
}

function killCell(cell) {
  cell.classList.remove("alive");
  cell.setAttribute("data-alive", "false");
}

function getNeighbor(row, col) {
  return document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
}

function getNeighbors(cell) {
  const { row, col } = cell;
  const neighbors = [];

  // Check up neighbor
  if (row > 0) {
    neighbors.push(getNeighbor(row - 1, col));
  }

  // Check down neighbor
  if (row < rowSize - 1) {
    neighbors.push(getNeighbor(row + 1, col));
  }

  // Check left neighbor
  if (col > 0) {
    neighbors.push(getNeighbor(row, col - 1));
  }

  // Check right neighbor
  if (col < columnSize - 1) {
    neighbors.push(getNeighbor(row, col + 1));
  }

  // Check diagonal up left neighbor
  if (col > 0 && row > 0) {
    neighbors.push(getNeighbor(row - 1, col - 1));
  }

  // Check diagonal up right neightbor
  if (col < columnSize - 1 && row > 0) {
    neighbors.push(getNeighbor(row - 1, col + 1));
  }

  // Check diagonal down left neightbor
  if (row < rowSize - 1 && col > 0) {
    neighbors.push(getNeighbor(row + 1, col - 1));
  }

  // Check diagonal down right neightbor
  if (row < rowSize - 1 && col < columnSize - 1) {
    neighbors.push(getNeighbor(row + 1, col + 1));
  }

  return neighbors.filter((neighbor) => !!neighbor);
}

function getLivingNeighborsCount(neighbors) {
  let count = 0;
  neighbors.forEach((neighbor) => {
    if (neighbor.getAttribute("data-alive") === "true") {
      count++;
    }
  });
  return count;
}

function updateCells() {
  // iterate through grid cells and update their status per animation tick
  continueUpdating = false;
  const cellsMarkedForDeath = [];
  const cellsMarkedForBirth = [];
  gridCellIds.forEach((cellId) => {
    const cell = document.getElementById(cellId);
    const cellStatus = cell.getAttribute("data-alive");
    const neighbors = cellNeighborMap[cellId];
    const liveNeighborsCount = getLivingNeighborsCount(neighbors);
    // if cell is dead
    if (cellStatus === "false") {
      // revive if 3 neighbors alive
      if (liveNeighborsCount === 3) {
        continueUpdating = true;
        cellsMarkedForBirth.push(cell);
      }
      // if cell is alive kill if too few neighbors or too many
    } else if (liveNeighborsCount < 2 || liveNeighborsCount > 3) {
      continueUpdating = true;
      cellsMarkedForDeath.push(cell);
    }
  });

  cellsMarkedForBirth.forEach((cell) => birthCell(cell));
  cellsMarkedForDeath.forEach((cell) => killCell(cell));
}

const generateGrid = () => {
  // Create cells
  for (let row = 0; row < rowSize; row++) {
    for (let col = 0; col < columnSize; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      const cellId = uuidv4();
      cell.id = cellId;
      cell.setAttribute("data-alive", "false");
      cell.setAttribute("data-row", row);
      cell.setAttribute("data-col", col);

      gridCellIds.push(cellId);
      grid.appendChild(cell);
    }
  }
  // get cell neighbors
  gridCellIds.forEach((cellId) => {
    const cell = document.getElementById(cellId);
    const row = parseFloat(cell.getAttribute("data-row"));
    const col = parseFloat(cell.getAttribute("data-col"));
    const neighbors = getNeighbors({ row, col });
    cellNeighborMap[cellId] = neighbors;
  });
};

const animate = withFrameDelay(() => {
  updateCells();
  currentGeneration++;
  generation.innerText = `${currentGeneration}`;
  if (continueUpdating) {
    animate();
  }
}, 16.67);

function reset() {
  if (gridCellIds) {
    gridCellIds.forEach((cellId) => {
      const cell = document.getElementById(cellId);
      cell.setAttribute("data-alive", "false");
      cell.classList.remove("alive");
    });
  }
  continueUpdating = false;
  currentGeneration = 0;
}

function randomizeGrid() {
  reset();
  const seed = parseFloat(seedField.value || Math.random() * 100000);
  const probability = parseFloat(probabilityField.value || 0.3);
  const random = createSeededRandom(seed);
  gridCellIds.forEach((cellId) => {
    const cell = document.getElementById(cellId);
    // Use seeded random to determine if cell is alive
    if (random() < probability) {
      cell.classList.add("alive");
      cell.setAttribute("data-alive", "true");
    }
  });
}

function handleStart() {
  continueUpdating = true;
  animate();
}

function handleGridClick(event) {
  if (continueUpdating === false) {
    const cell = event.target;
    const cellStatus = cell.getAttribute("data-alive");
    if (cellStatus === "false") {
      birthCell(cell);
    } else if (cellStatus === "true") {
      killCell(cell);
    }
  }
}

generateGrid();
grid.addEventListener("click", handleGridClick);
startButton.addEventListener("click", handleStart);
randomizeButton.addEventListener("click", randomizeGrid);
resetButton.addEventListener("click", reset);
