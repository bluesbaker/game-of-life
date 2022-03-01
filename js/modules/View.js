export class View {
    constructor(canvas, axisSize) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');        
        this.axisSize = axisSize;
        this.xMousePosition = 0;
        this.yMousePosition = 0;
        this.cellSize = 0;
        this.xSize = 0;
        this.ySize = 0;
    }

    /**
     * Initialize View container
     */
    init() {
        this.cellSize = Math.max(this.canvas.width, this.canvas.height) / this.axisSize;
        this.xSize = Math.floor(this.canvas.width / this.cellSize);
        this.ySize = Math.floor(this.canvas.height / this.cellSize);
    }

    /**
     * Set canvas and context size
     * @param  {...any} sizes - HTML-container or definite sizes(width, height)
     */
    setSize(...sizes) {
        let width;
        let height;

        if(sizes.length === 0) {
            throw new Error('Arguments are empty!');
        }
        // HTML-container?
        else if(sizes[0].constructor.name === 'HTMLElement') {
            width = sizes[0].offsetWidth - (sizes[0].offsetWidth - sizes[0].clientWidth);
            height = sizes[0].offsetHeight - (sizes[0].offsetHeight - sizes[0].clientHeight);         
        }
        // or definite sizes
        else {
            width = +sizes[0];
            height = +sizes[1] || +sizes[0];
        }

        this.canvas.width = width;
        this.canvas.height = height;
    }
 
    /**
     * Get current position by mouse coords
     * @param {number} mouseX - mouse x-position
     * @param {number} mouseY - mouse y-position
     * @returns Position of grid
     */
    getMousePosition(mouseX, mouseY) {
        let width = this.canvas.width;
        let height = this.canvas.height;
        let xPosition = Math.floor((((mouseX + width) / width) - 1) * this.xSize);
        let yPosition = Math.floor((((mouseY + height) / height) - 1) * this.ySize);
    
        // safe output
        xPosition = (xPosition >= this.xSize) ? (this.xSize - 1) : (xPosition < 0) ? 0 : xPosition;
        yPosition = (yPosition >= this.ySize) ? (this.ySize - 1) : (yPosition < 0) ? 0 : yPosition;

        return {
            x: xPosition,
            y: yPosition
        }
    }

    /**
     * Clear context
     */
    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}