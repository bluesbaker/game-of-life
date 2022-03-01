import { View } from './View.js';
import { Cell } from './Cell.js';

class Game extends View {
    constructor(canvas, axisSize = 100) {
        super(canvas, axisSize);
        this.cellMatrix = null;
        this.nextGenerationMasks = null;
    }

    init() {
        super.init();
        this.initMatrix();
        this.initMasks();
    }

    initMatrix() {
        this.cellMatrix = new Array(this.xSize);
    
        // create matrix
        for(let x = 0; x < this.xSize; x++) {
            this.cellMatrix[x] = new Array(this.ySize);
    
            // init matrix
            for(let y = 0; y < this.ySize; y++) {
                let xPosition = x * this.cellSize;
                let yPosition = y * this.cellSize;
                
                // colorful cell
                let red = Math.floor(Math.abs(Math.sin(yPosition * Math.PI / this.canvas.height) * (255 - 150) + 150));
                let green = Math.floor(Math.abs(Math.sin(xPosition * Math.PI / this.canvas.width) * (255 - 150) + 150));  
                let blue = 255; 
                let color = `rgb(${red}, ${green}, ${blue})`;

                let cell = new Cell(x * this.cellSize, y * this.cellSize, color, true);
                this.cellMatrix[x][y] = cell;
            }
        }
    }

    initMasks() {
        this.nextGenerationMasks = new Array(this.cellMatrix?.length);

        // create masks
        for(let x = 0; x < this.nextGenerationMasks.length; x++) {
            this.nextGenerationMasks[x] = new Array(this.cellMatrix[x]?.length);

            // init masks
            for(let y = 0; y < this.nextGenerationMasks[x].length; y++) {
                this.nextGenerationMasks[x][y] = true;
            }
        }
    }

    getNextGenerationMasks() {
        for(let x = 0; x < this.cellMatrix.length; x++) {
            for(let y = 0; y < this.cellMatrix[x].length; y++) {                       
                let cell = this.cellMatrix[x][y];
                let neighbourCount = this.getNeighbourCount(x, y);

                if(cell.isHidden) {
                    if(neighbourCount === 3) {
                        this.nextGenerationMasks[x][y] = false;
                    }
                    else {
                        this.nextGenerationMasks[x][y] = true;
                    }
                }
                else {
                    if(neighbourCount < 2 || neighbourCount > 3) {
                        this.nextGenerationMasks[x][y] = true;
                    }
                    else {
                        this.nextGenerationMasks[x][y] = false;
                    }
                }
            }
        }
    }

    getNeighbourCount(xPosition, yPosition) {
        let count = 0;
    
        for(let x = xPosition - 1; x <= xPosition + 1; x++) {
            for(let y = yPosition - 1; y <= yPosition + 1; y++) {
                // skip yourself
                if(xPosition == x && yPosition == y) continue;
    
                let mirrorCoords = this.getMirrorCoords(x, y);
                if(!this.cellMatrix[mirrorCoords.x][mirrorCoords.y].isHidden) count++;
            }
        }
    
        return count;
    }

    getMirrorCoords(x, y) {
        // correct a mirror coords
        let correctX = (x < 0) ? (this.cellMatrix.length - 1) : (x > this.cellMatrix.length - 1) ? 0 : x;
        let correctY = (y < 0) ? (this.cellMatrix[0].length - 1) : (y > this.cellMatrix[0].length - 1) ? 0 : y;
    
        return {
            x: correctX,
            y: correctY
        }
    }

    drawCell(x, y) {
        let mirrorCoords = this.getMirrorCoords(x, y);
        let cell = this.cellMatrix[mirrorCoords.x][mirrorCoords.y];

        cell.isHidden = false;
        this.context.fillStyle = cell.color;
        this.context.fillRect(cell.x, cell.y, this.cellSize, this.cellSize);
    }

    drawMatrix() {
        // at the beginning clear matrix
        this.clear();

        for(let x = 0; x < this.cellMatrix?.length; x++) {
            for(let y = 0; y < this.cellMatrix[x]?.length; y++) {
                let cell = this.cellMatrix[x][y];
                cell.isHidden = this.nextGenerationMasks[x][y];
                if(!cell.isHidden) {
                    this.context.fillStyle = cell.color;
                    this.context.fillRect(cell.x, cell.y, this.cellSize, this.cellSize);
                }     
            }
        }
    }

    clearCell(x, y) {
        let cell = this.cellMatrix[x][y];
        cell.isHidden = true;
        this.context.clearRect(cell.x, cell.y, this.cellSize, this.cellSize);
    }

    clearMatrix() {
        // init new matrix
        this.initMatrix();   

        // init new masks
        this.initMasks();

        // clear context
        this.clear()
    }

    gameLoop() {
        // generate next generation masks
        this.getNextGenerationMasks();
    
        // clear game layout
        this.clear();
    
        // draw updated matrix
        this.drawMatrix();
    }
}

export { Game }