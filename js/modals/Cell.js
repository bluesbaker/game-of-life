class Cell {
    constructor(x, y, color = null, isHidden = true) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.isHidden = isHidden;
    }
}

export { Cell }