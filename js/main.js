import { Grid } from './modals/Grid.js';
import { Game } from './modals/Game.js';
import { addListener, removeListener } from './tools/eventListener.js';
import { parsePattern, patternToSVG } from './tools/patternTools.js';

// advanced "addEventListener" and "removeEventListener"
EventTarget.prototype.addListener = addListener;
EventTarget.prototype.removeListener = removeListener;

// main container
let gameContainer = document.getElementById('gameContainer');

// layouts
const gridLayout = document.getElementById('gridLayout');
const gameLayout = document.getElementById('gameLayout');
const overlapLayout = document.getElementById('overlapLayout');

// option inputs
const axisInput = document.getElementById('axisInput');
const buildButton = document.getElementById('buildButton');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const stopButton = document.getElementById('stopButton');

// tools
const randomizeButton = document.getElementById('randomizeButton');
const patternButtons = [...document.getElementsByClassName('pattern')];

// game's objects
const grid = new Grid(gridLayout);
const game = new Game(gameLayout);
const overlap = new Game(overlapLayout);
let currentPattern = [[0,0]];
let axisSize = null;
let loopID = null;

// options events
axisInput.addListener('input', inputNumber);
buildButton.addListener('click', buildGame);
startButton.addListener('click', startGame);
pauseButton.addListener('click', pauseGame);
stopButton.addListener('click', stopGame);

// game events
gameContainer.addListener('mousepress', addPattern);
gameContainer.addListener('mousemove', viewPattern);
gameContainer.addListener('mouseleave', () => { overlap.clear() });

// document events
window.addListener('DOMContentLoaded', loadPatterns);
window.addListener('resize', buildGame);

// tools actions
randomizeButton.addListener('click', randomizeMatrix);
patternButtons.map(pb => pb.addListener('click', setPattern));

// first build!
buildGame();

// listeners
function buildGame(event) {
    stopGame();
    axisSize = +axisInput.value || 100;

    // set axis size
    grid.axisSize = axisSize;
    game.axisSize = axisSize;
    overlap.axisSize = axisSize;

    // set context size
    grid.setSize(gameContainer);
    game.setSize(gameContainer);
    overlap.setSize(gameContainer);

    // init game objects
    grid.init();
    game.init();
    overlap.init();

    // and draw
    grid.draw();
    game.drawMatrix();
}

function startGame(event) {
    if(loopID == null) {
        loopID = setInterval(() => {
            game.gameLoop();
        }, 1000 / 50);
    }
}

function pauseGame(event) {
    if(loopID != null) {
        clearInterval(loopID);
        loopID = null;
    }
}

function stopGame(event) {
    if(loopID != null) {
        clearInterval(loopID);
        loopID = null;
    }
    game.clearMatrix();
}

function addPattern(event) {
    if(loopID == null) {
        let mouseX = event.pageX - event.target.offsetLeft + gridLayout.scrollLeft;
        let mouseY = event.pageY - event.target.offsetTop + gridLayout.scrollTop;
        let { x, y } = game.getMousePosition(mouseX, mouseY);
    
        for(let i = 0; i < currentPattern.length; i++) {          
            game.drawCell(x + currentPattern[i][0], y + currentPattern[i][1]);    
        } 
    }
}

function viewPattern(event) {
    if(loopID == null) {
        overlap.clear();

        let mouseX = event.pageX - event.target.offsetLeft + gridLayout.scrollLeft;
        let mouseY = event.pageY - event.target.offsetTop + gridLayout.scrollTop;
        let { x, y } = overlap.getMousePosition(mouseX, mouseY);

        for(let i = 0; i < currentPattern.length; i++) {          
            overlap.drawCell(x + currentPattern[i][0], y + currentPattern[i][1]);    
        }      
    }    
}

function loadPatterns(event) {
    for(let i = 0; i < patternButtons.length; i++) {
        let button = patternButtons[i];
        let pattern = parsePattern(button.getAttribute("data-paint-pattern"));

        if(Array.isArray(pattern)) {
            let svgIcon = patternToSVG(pattern);
            button.appendChild(svgIcon);
        }       
    }
}

function setPattern(event) {
    let attrPattern = event.currentTarget.getAttribute('data-paint-pattern');
    currentPattern = parsePattern(attrPattern);
    patternButtons.map((b) => b.setAttribute('data-pattern-checked', false));
    event.currentTarget.setAttribute('data-pattern-checked', true);
}

function randomizeMatrix(event) {
    game.clearMatrix();
    for(let x = 0; x < game.cellMatrix.length; x++) {
        for(let y = 0; y < game.cellMatrix[x].length; y++) {
            !!Math.floor(Math.random() * 2) && game.drawCell(x, y);
        }
    }
}

function inputNumber(event) {
    event.target.value = event.target.value.replace(/[^+\d]/g, '');
}