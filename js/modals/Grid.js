import { View } from './View.js';

class Grid extends View {
    constructor(canvas, axisSize = 100, gridColor = 'rgb(0, 0, 0, 0.05)') {
        super(canvas, axisSize);       
        this.gridColor = gridColor;
    }

    draw() {
        // at the beginning clear grid
        this.clear();

        // lines color
        this.context.strokeStyle = this.gridColor;

        // horizontal lines
        for(let x = 0; x <= this.xSize; x++) {
            this.context.beginPath();
            this.context.moveTo(x * this.cellSize, 0);
            this.context.lineTo(x * this.cellSize, this.ySize * this.cellSize)
            this.context.closePath();
            this.context.stroke();
        }

        // vertical lines
        for(let y = 0; y <= this.ySize; y++) {
            this.context.beginPath();
            this.context.moveTo(0, y * this.cellSize);
            this.context.lineTo(this.xSize * this.cellSize, y * this.cellSize);
            this.context.closePath();
            this.context.stroke();
        }
    }
}

export { Grid };