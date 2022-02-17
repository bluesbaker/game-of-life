/**
 * Parse a string pattern to an array pattern
 * @param {string} stringPattern - for example, '0,0;-1;0;...'
 * @returns Array pattern for example, [[0,0], [-1,0]...]
 */
function parsePattern(stringPattern) {
    return stringPattern.split(';').map(sp => sp.split(',').map(sp => +sp));
}

/**
 * Get the svg image on a base pattern
 * @param {Array<string>} pattern - array pattern
 * @param {number} size - svg size
 * @param {string} color - svg color for example, rbg(r,g,b,a) or hexcolor
 * @returns svg image
 */
function patternToSVG(pattern, size = 21, color = '#ffffff') {
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    let iconCellSize = size / 3;
    let centerCell = { x: iconCellSize, y: iconCellSize }

    svg.setAttribute("aria-hidden","true");
    svg.setAttribute('viewbox', `0 0 ${size} ${size}`);
    svg.setAttribute('width', size + 'px');
    svg.setAttribute('height', size + 'px');

    for(let i = 0; i < pattern.length; i++) {
        let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute('x', centerCell.x + (pattern[i][0] * iconCellSize));
        rect.setAttribute('y', centerCell.y + (pattern[i][1] * iconCellSize));
        rect.setAttribute('width', iconCellSize);
        rect.setAttribute('height', iconCellSize);
        rect.setAttribute('fill', color);   
        svg.appendChild(rect);
    }

    return svg;
}

export { parsePattern, patternToSVG }