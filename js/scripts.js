class Cell {
    constructor(context, x, y, width, height, color = null) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isDead = false;
        this.color = color;
        
        // if color is null then let's go to the party
        if(this.color == null) {
            let contextWidth = this.context.canvas.width;
            let contextHeight = this.context.canvas.height;
            let green = Math.floor(Math.abs(Math.sin(this.x * Math.PI / contextWidth) * (255 - 150) + 150));  
            let red = Math.floor(Math.abs(Math.sin(this.y * Math.PI / contextHeight) * (255 - 150) + 150)); 
            this.color = `rgb(${red}, ${green}, 255)`;
        }
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

// tools
let randomizeButton = document.getElementById('randomizeButton');
let patternButtons = [...document.getElementsByClassName('pattern')];

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
let paintPattern = [[0,0]];

// mouse actions of game layout
// 'overlapLayout' - is a upper layout 
overlapLayout.onmousedown = onMouseDown;
overlapLayout.onmouseup = onMouseUp;
overlapLayout.onmousemove = onMouseMove;
overlapLayout.onmouseleave = onMouseLeave;

// options actions
sizeInput.oninput = inputSize;
buildButton.onmouseup = init;
startButton.onmouseup = startGame;
clearButton.onmouseup = clearMatrix;

// tools actions
randomizeButton.onmouseup = randomizeMatrix;
patternButtons.map((b) => b.onmouseup = setPaintPattern);

// window action
window.onresize = init; 
window.addEventListener('DOMContentLoaded', loadTools);

// the first initialization
init();

function init() {
    if(!+sizeInput.value) return;

    // resize by current window
    for(let i = 0; i < layouts.length; i++) {
        layouts[i].width = getGameBlockSize();
        layouts[i].height = getGameBlockSize();
    }

    gridSize = +sizeInput.value;
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
            let cell = new Cell(gameContext, x * cellSize, y * cellSize, cellSize, cellSize);
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

function inputSize(event) {
    event.target.value = event.target.value.replace(/[^+\d]/g, '');
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

    // draw updated matrix
    drawMatrix();
}

function onMouseUp() {
    isMouseInput = false;
}  

function onMouseDown(event) {
    isMouseInput = true;
    // painting at the first click
    onMouseMove(event);
}  

function onMouseMove(event) {
    let position = getCorrectPosition(event);

    // if mouse down then add cell
    if(isMouseInput && gameId == null) {
        for(let i = 0; i < paintPattern.length; i++) {
            let mirrorCoords = getMirrorCoords(position.x + paintPattern[i][0], position.y + paintPattern[i][1]);           
            addCell(mirrorCoords.x, mirrorCoords.y);       
        }
    }
    // ...or draw preview 
    else {
        overlapContext.clearRect(0, 0, overlapLayout.width, overlapLayout.height);
        for(let i = 0; i < paintPattern.length; i++) {
            let color = 'rgb(255, 255, 255, 0.5)';
            let mirrorCoords = getMirrorCoords(position.x + paintPattern[i][0], position.y + paintPattern[i][1]);
            let possibleCell = new Cell(
                overlapContext, 
                mirrorCoords.x * cellSize, 
                mirrorCoords.y * cellSize, 
                cellSize, 
                cellSize,
                color);           
            possibleCell.draw();       
        }
    }            
}

function onMouseLeave() {
    overlapLayout.getContext('2d').clearRect(0, 0, overlapLayout.width, overlapLayout.height);
    onMouseUp();
}

function getCorrectPosition(event) {
    let mouseX = event.pageX - event.target.offsetLeft + gameBlock.scrollLeft;
    let mouseY = event.pageY - event.target.offsetTop + gameBlock.scrollTop;
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

            let mirrorCoords = getMirrorCoords(x, y);
            if(!cellMatrix[mirrorCoords.x][mirrorCoords.y].isDead) count++;
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

function getMirrorCoords(xCoord, yCoord) {
    // correct a mirror coords
    let correctX = (xCoord < 0) ? (cellMatrix.length - 1) : (xCoord > cellMatrix.length - 1) ? 0 : xCoord;
    let correctY = (yCoord < 0) ? (cellMatrix[0].length - 1) : (yCoord > cellMatrix[0].length - 1) ? 0 : yCoord;

    return {
        x: correctX,
        y: correctY
    }
}

function addCell(positionX, positionY) {
    cellMatrix[positionX][positionY].isDead = false;
    nextGenerationMasks[positionX][positionY] = false;
    cellMatrix[positionX][positionY].draw();
}

function loadTools(event) {
    for(let i = 0; i < patternButtons.length; i++) {
        let button = patternButtons[i];
        let pattern = parsePattern(button.getAttribute("data-paint-pattern"));

        if(Array.isArray(pattern)) {
            let svgIcon = patternToSVG(21, '#ffffff', pattern);
            button.appendChild(svgIcon);
        }       
    }
}

function parsePattern(dataPattern) {
    return dataPattern.split(';').map(pc => pc.split(',').map(sc => +sc));
}

function patternToSVG(size = 24, color = '#ffffff', path) {
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    let iconCellSize = size / 3;
    let centerCell = { x: iconCellSize, y: iconCellSize }

    svg.setAttribute("aria-hidden","true");
    svg.setAttribute('viewbox', `0 0 ${size} ${size}`);
    svg.setAttribute('width', size + 'px');
    svg.setAttribute('height', size + 'px');

    for(let i = 0; i < path.length; i++) {
        let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute('x', centerCell.x + (path[i][0] * iconCellSize));
        rect.setAttribute('y', centerCell.y + (path[i][1] * iconCellSize));
        rect.setAttribute('width', iconCellSize);
        rect.setAttribute('height', iconCellSize);
        rect.setAttribute('fill', color);   
        svg.appendChild(rect);
    }

    return svg;
}

function setPaintPattern(event) {
    let attrPattern = event.currentTarget.getAttribute('data-paint-pattern');
    paintPattern = parsePattern(attrPattern);
    patternButtons.map((b) => b.setAttribute('data-pattern-checked', false));
    event.currentTarget.setAttribute('data-pattern-checked', true);
}

function randomizeMatrix() {
    clearMatrix();
    for(let x = 0; x < cellMatrix.length; x++) {
        for(let y = 0; y < cellMatrix[x].length; y++) {
            !!Math.floor(Math.random() * 2) && addCell(x, y);
        }
    }
}
