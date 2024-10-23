import { createSeededRandom, uuidv4, withFrameDelay } from "./utils.mjs";

const seedField = document.getElementById("seed-field");
const grid = document.getElementById("gridContainer");
const probabilityField = document.getElementById("probability-field");
const startButton = document.getElementById("start-button");
const welcome = document.getElementById("welcome-header");
const generation = document.getElementById("generation");
// when modifying these two values, don't forget to update css class for gridContainer
const columnSize = 50;
const rowSize = 50;

let currentGeneration = 0;
let continueUpdating = true;

let gridCellIds = [];

function reviveCell(cell) {
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
  gridCellIds.forEach((cellId) => {
    const cell = document.getElementById(cellId);
    const cellStatus = cell.getAttribute("data-alive");
    const row = parseFloat(cell.getAttribute("data-row"));
    const col = parseFloat(cell.getAttribute("data-col"));
    const neighbors = getNeighbors({ row, col });
    const liveNeighborsCount = getLivingNeighborsCount(neighbors);
    // if cell is dead
    if (cellStatus === "false") {
      // revive if 3 neighbors alive
      if (liveNeighborsCount === 3) {
        continueUpdating = true;
        reviveCell(cell);
      }
      // if cell is alive kill if too few neighbors or too many
    } else if (liveNeighborsCount < 2 || liveNeighborsCount > 3) {
      continueUpdating = true;
      killCell(cell);
    }
  });
}

const generateGrid = () => {
  const seed = parseFloat(seedField.value || Math.random() * 100000);
  const probability = parseFloat(probabilityField.value || 0.3);
  const random = createSeededRandom(seed);

  // Create cells
  for (let row = 0; row < rowSize; row++) {
    for (let col = 0; col < columnSize; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      const cellId = uuidv4();
      cell.id = cellId;
      // Use seeded random to determine if cell is alive
      if (random() < probability) {
        cell.classList.add("alive");
        cell.setAttribute("data-alive", "true");
      } else {
        cell.setAttribute("data-alive", "false");
      }
      cell.setAttribute("data-row", row);
      cell.setAttribute("data-col", col);

      gridCellIds.push(cellId);
      grid.appendChild(cell);
    }
  }
};

const animate = withFrameDelay(() => {
  updateCells();
  currentGeneration++;
  generation.innerText = `${currentGeneration}`;
  if (continueUpdating) {
    animate();
  }
}, 50);

function cleanUp() {
  if (gridCellIds) {
    gridCellIds.forEach((cellId) => {
      const cell = document.getElementById(cellId);
      grid.removeChild(cell);
    });
  }
  continueUpdating = true;
  currentGeneration = 0;
  gridCellIds = [];
}

function handleStart() {
  cleanUp();
  generateGrid();
  grid.style.cssText = "display: grid;";
  welcome.style.cssText = "display: none;";
  animate();
}

startButton.addEventListener("click", handleStart);
