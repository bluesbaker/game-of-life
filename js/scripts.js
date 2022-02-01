class Cell {
    constructor(context, color, x, y, width, height) {
        this.context = context;
        this.color = color;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isDead = false;
    }

    draw() {
        if(!this.isDead) {
            this.context.fillStyle = this.color;
            this.context.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

// options
let sizeInput = document.getElementById('sizeInput');
let buildButton = document.getElementById('buildButton');
let startButton = document.getElementById('startButton');
let clearButton = document.getElementById('clearButton');

// canvas layouts
let overlapLayout = document.getElementById('overlapLayout');
let gameLayout = document.getElementById('gameLayout');
let gridLayout = document.getElementById('gridLayout');

// context
let overlapContext = overlapLayout.getContext('2d');
let gameContext = gameLayout.getContext('2d');
let gridContext = gridLayout.getContext('2d');

// ui classes
let gameBlock = document.getElementsByClassName('game-block')[0];
let layouts = document.getElementsByClassName('layout');

// game variables
let gameId = null;
let cellMatrix = null;
let nextGenerationMasks = null;
let isMouseInput = false;
let gridSize = 0;
let cellSize = 0;

// mouse actions of game layout
// 'overlapLayout' - is a upper layout 
overlapLayout.onmousedown = onMouseDown;
overlapLayout.onmouseup = onMouseUp;
overlapLayout.onmousemove = onMouseMove;
overlapLayout.onmouseleave = onMouseLeave;

// input actions
sizeInput.oninput = inputSize;
buildButton.onmouseup = init;
startButton.onmouseup = startGame;
clearButton.onmouseup = clearMatrix;

// window action
window.onresize = init; 

// the first initialization
init();

function init() {
    // resize by current window
    for(let i = 0; i < layouts.length; i++) {
        layouts[i].width = getGameBlockSize();
        layouts[i].height = getGameBlockSize();
    }

    gridSize = +sizeInput.value || 100;
    cellSize = overlapLayout.width / gridSize;

    // init virgin matrix
    initMatrix();

    // if masks length is not equal grid size then init virgin masks 
    // or save previously masks for correct redraw
    if(nextGenerationMasks == null || nextGenerationMasks.length != gridSize) {
        initMasks();
    }

    // and draw
    drawMatrix();
    drawGrid();
}

function initMasks() {
    nextGenerationMasks = new Array(gridSize);

    // create masks
    for(let x = 0; x < nextGenerationMasks.length; x++) {
        nextGenerationMasks[x] = new Array(gridSize);

        // init masks
        for(let y = 0; y < nextGenerationMasks[x].length; y++) {
            nextGenerationMasks[x][y] = true;
        }
    }
}

function initMatrix() {
    cellMatrix = new Array(gridSize);

    // create matrix
    for(let x = 0; x < cellMatrix.length; x++) {
        cellMatrix[x] = new Array(gridSize);

        // init matrix
        for(let y = 0; y < cellMatrix[x].length; y++) {
            let cell = new Cell(gameContext, '#fff', x * cellSize, y * cellSize, cellSize, cellSize);
            cell.isDead = true;
            cellMatrix[x][y] = cell;
        }
    }
}

function drawGrid() {
    let strokeColor = 'rgb(0, 0, 0, 0.05)'

    // horizontal lines
    for(let x = 0; x < gridSize; x++) {
        gridContext.strokeStyle = strokeColor;
        gridContext.beginPath();
        gridContext.moveTo(x * cellSize, 0);
        gridContext.lineTo(x * cellSize, gridLayout.height)
        gridContext.closePath();
        gridContext.stroke();
    }
    // vertical lines
    for(let y = 0; y < gridSize; y++) {
        gridContext.strokeStyle = strokeColor;
        gridContext.beginPath();
        gridContext.moveTo(0, y * cellSize);
        gridContext.lineTo(gridLayout.width, y * cellSize);
        gridContext.closePath();
        gridContext.stroke();
    }
}

function drawMatrix() {
    for(let x = 0; x < cellMatrix.length; x++) {
        for(let y = 0; y < cellMatrix[x].length; y++) {
            cellMatrix[x][y].isDead = nextGenerationMasks[x][y];
            cellMatrix[x][y].draw();
        }
    }
}

function inputSize(element) {
    let input = element.target;
    let regex = /[^+\d]/g;   
    input.value = input.value.replace(regex, '');

    if(input.value == '') {
        buildButton.disabled = true;
    }
    else {
        buildButton.disabled = false;
    }
}

function startGame() {
    if(gameId == null) {
        gameId = setInterval(gameLoop, 1000 / 50);  
        startButton.value = 'PAUSE';
    }
    else {
        clearInterval(gameId);
        gameId = null;
        startButton.value = 'START';
    }                  
}

function clearMatrix() {
    startButton.value = 'START';

    // stop game loop
    if(gameId != null) {
        clearInterval(gameId);
        gameId = null;  
    }

    // init new matrix
    initMatrix();

    // init new masks
    initMasks();

    // clear game layout
    gameContext.clearRect(0, 0, gameLayout.width, gameLayout.height);
}

function gameLoop() {
    // generate next generation masks
    getNextGenerationMasks();

    // clear game layout
    gameContext.clearRect(0, 0, gameLayout.width, gameLayout.height);

    drawMatrix();
}

function onMouseUp() {
    isMouseInput = false;
}  

function onMouseDown(element) {
    isMouseInput = true;
    // painting at the first click
    onMouseMove(element);
}  

function onMouseMove(element) {
    let position = getCorrectPosition(element);

    if(isMouseInput && gameId == null) {
        cellMatrix[position.x][position.y].isDead = false;
        nextGenerationMasks[position.x][position.y] = false;
        cellMatrix[position.x][position.y].draw();
    }  
    else {
        let overlapContext = overlapLayout.getContext('2d');
        let possibleCell = new Cell(overlapContext, 'rgb(255, 255, 255, 0.5)', position.x * cellSize, position.y * cellSize, cellSize, cellSize);
        overlapContext.clearRect(0, 0, overlapLayout.width, overlapLayout.height);
        possibleCell.draw();
    }            
}

function onMouseLeave() {
    overlapLayout.getContext('2d').clearRect(0, 0, overlapLayout.width, overlapLayout.height);
    onMouseUp();
}

function getCorrectPosition(element) {
    let mouseX = element.pageX - element.target.offsetLeft + gameBlock.scrollLeft;
    let mouseY = element.pageY - element.target.offsetTop + gameBlock.scrollTop;
    let cellX = Math.floor((((mouseX + overlapLayout.width) / overlapLayout.width) - 1) * gridSize);
    let cellY = Math.floor((((mouseY + overlapLayout.height) / overlapLayout.height) - 1) * gridSize);

    // safe output
    cellX = (cellX >= gridSize) ? (gridSize - 1) : (cellX < 0) ? 0 : cellX;
    cellY = (cellY >= gridSize) ? (gridSize - 1) : (cellY < 0) ? 0 : cellY;

    return {
        x: cellX,
        y: cellY
    }
}

function getNeighbourCount(xPosition, yPosition) {
    let count = 0;

    for(let x = xPosition - 1; x <= xPosition + 1; x++) {
        for(let y = yPosition - 1; y <= yPosition + 1; y++) {
            if(xPosition == x && yPosition == y) continue;

            // correct a mirror coords
            let correctX = (x < 0) ? (cellMatrix.length - 1) : (x > cellMatrix.length - 1) ? 0 : x;
            let correctY = (y < 0) ? (cellMatrix[0].length - 1) : (y > cellMatrix[0].length - 1) ? 0 : y;

            if(!cellMatrix[correctX][correctY].isDead) count++;
        }
    }

    return count;
}

function getGameBlockSize() {
    return gameBlock.offsetWidth - (gameBlock.offsetWidth - gameBlock.clientWidth);
}

function getNextGenerationMasks() {
    if(cellMatrix != null && cellMatrix.length > 0 && cellMatrix[0].length > 0) {
        for(let x = 0; x < cellMatrix.length; x++) {
            for(let y = 0; y < cellMatrix[x].length; y++) {                       
                let cell = cellMatrix[x][y];
                let neighbourCount = getNeighbourCount(x, y);

                if(cell.isDead) {
                    if(neighbourCount == 3) {
                        nextGenerationMasks[x][y] = false;
                    }
                    else {
                        nextGenerationMasks[x][y] = true;
                    }
                }
                else {
                    if(neighbourCount < 2 || neighbourCount > 3) {
                        nextGenerationMasks[x][y] = true;
                    }
                    else {
                        nextGenerationMasks[x][y] = false;
                    }
                }
            }
        }
    }
}
