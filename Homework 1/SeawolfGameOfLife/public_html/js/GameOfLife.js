/*
 * Conway's Game of Life (Seawolf Edition)
 * 
 * This JavaScript file should contain the full implementation of
 * our Game of Life simulation. It does all data management, including
 * updating the game grid, as well as controlling frame rate timing
 * and all rendering to the canvas.
 * 
 * Authors: Richard McKenna & James Lynn
 */

// GAME OF LIFE GLOBAL CONSTANTS & VARIABLES

// CONSTANTS
var BRIGHT_CELL;
var DEAD_CELL;
var LIVE_CELL;
var GHOST_CELL;
var VOID_CELL;
var BRIGHT_COLOR;
var VOID_COLOR;
var LIVE_COLOR;
var GHOST_COLOR;
var GRID_LINES_COLOR;
var TEXT_COLOR;
var TOP_LEFT;
var TOP_RIGHT;
var BOTTOM_LEFT;
var BOTTOM_RIGHT;
var TOP;
var BOTTOM;
var LEFT;
var RIGHT;
var CENTER;
var MILLISECONDS_IN_ONE_SECOND;
var MAX_FPS;
var MIN_FPS;
var FPS_INC;
var FPS_X;
var FPS_Y;
var MAX_CELL_LENGTH;
var MIN_CELL_LENGTH;
var CELL_LENGTH_INC;
var CELL_LENGTH_X;
var CELL_LENGTH_Y;
var GRID_LINE_LENGTH_RENDERING_THRESHOLD;

// FRAME RATE TIMING VARIABLES
var timer;
var fps;
var frameInterval;

// CANVAS VARIABLES
var canvasWidth;
var canvasHeight;
var canvas;
var ghostCanvas;
var canvas2D;
var ghostCanvas2D;

// GRID VARIABLES
var gridWidth;
var gridHeight;
var updateGrid;
var renderGrid;
var ghostUpdateGrid;
var ghostRenderGrid;

// RENDERING VARIABLES
var cellLength;

// PATTERN PIXELS
var patterns;
var cellLookup;
var imgDir;

// INITIALIZATION METHODS

/*
 * This method initializes the Game of Life, setting it up with
 * and empty grid, ready to accept additions at the request
 * of the user.
 */
function initGameOfLife()
{
    // INIT ALL THE CONSTANTS, i.e. ALL THE
    // THINGS THAT WILL NEVER CHANGE
    initConstants();
    
    // INIT THE RENDERING SURFACE
    initCanvas();
    
    // INIT ALL THE GAME-RELATED VARIABLES
    initGameOfLifeData();
    
    // INIT THE LOOKUP TABLES FOR THE SIMULATION
    initCellLookup();

    // LOAD THE PATTERNS FROM IMAGES
    initPatterns();
            
    // SETUP THE EVENT HANDLERS
    initEventHandlers();
            
    // RESET EVERYTHING, CLEARING THE CANVAS
    resetGameOfLife();
}

/*
 * This function initializes all the things that never change.
 */
function initConstants()
{
    // THESE REPRESENT THE THREE POSSIBLE STATES FOR EACH CELL
    DEAD_CELL = 0;   
    LIVE_CELL = 1;
    BRIGHT_CELL = 2;
    VOID_CELL = 3;
    
    // COLORS FOR RENDERING
    LIVE_COLOR = "#FF0000";
    GHOST_COLOR = "#FFB6C1";
    BRIGHT_COLOR = "#FF2098";
    VOID_COLOR = "#768FA5";
    GRID_LINES_COLOR = "#CCCCCC";
    TEXT_COLOR = "#7777CC";
    
    // THESE REPRESENT THE DIFFERENT TYPES OF CELL LOCATIONS IN THE GRID
    TOP_LEFT = 0;
    TOP_RIGHT = 1;
    BOTTOM_LEFT = 2;
    BOTTOM_RIGHT = 3;
    TOP = 4;
    BOTTOM = 5;
    LEFT = 6;
    RIGHT = 7;
    CENTER = 8;
    
    // FPS CONSTANTS
    MILLISECONDS_IN_ONE_SECOND = 1000;
    MAX_FPS = 33;
    MIN_FPS = 1;
    FPS_INC = 1;
    
    // CELL LENGTH CONSTANTS
    MAX_CELL_LENGTH = 32;
    MIN_CELL_LENGTH = 1;
    CELL_LENGTH_INC = 2;
    GRID_LINE_LENGTH_RENDERING_THRESHOLD = 8;
    
    // RENDERING LOCATIONS FOR TEXT ON THE CANVAS
    FPS_X = 20;
    FPS_Y = 450;
    CELL_LENGTH_X = 20;
    CELL_LENGTH_Y = 480;
}

/*
 * This method retrieves the canvas from the Web page and
 * gets a 2D drawing context so that we can render to it
 * when the time comes.
 */
function initCanvas()
{
    // GET THE CANVAS
    canvas = document.getElementById("game_of_life_canvas");
    //GET THE GHOST CANVAS
    ghostCanvas = document.getElementById("ghost_canvas");
    
    // GET THE 2D RENDERING CONTEXT
    canvas2D = canvas.getContext("2d");

    //GET THE 2D Rendering Context of Ghost Canvas
    ghostCanvas2D = ghostCanvas.getContext("2d");
    
    // INIT THE FONT FOR TEXT RENDERED ON THE CANVAS. NOTE
    // THAT WE'LL BE RENDERING THE FRAME RATE AND ZOOM LEVEL
    // ON THE CANVAS
    canvas2D.font = "24px Arial";
    
    // NOTE THAT THESE DIMENSIONS SHOULD BE THE
    // SAME AS SPECIFIED IN THE WEB PAGE, WHERE
    // THE CANVAS IS SIZED
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
}

/*
 * This function initializes all the important game-related
 * variables, including the necessary data structures for
 * managing the game grid.
 */
function initGameOfLifeData()
{    
    // INIT THE TIMING DATA
    timer = null;
    fps = MAX_FPS;
    frameInterval = MILLISECONDS_IN_ONE_SECOND/fps;

    // INIT THE CELL LENGTH
    cellLength = MIN_CELL_LENGTH;
}

/*
 * This function returns a JavaScript object, which is kind of like
 * a C struct in that it only has data. There are 9 different types of
 * cells in the grid, and so we use 9 CellType objects to store which
 * adjacent cells need to be checked when running the simulation.
 */
function CellType(initNumNeighbors, initCellValues)
{
    this.numNeighbors = initNumNeighbors;
    this.cellValues = initCellValues;
}

/*
 * This function initializes the 9 CellType objects that serve
 * as a lookup table for when we are running the simulation so
 * that we know which neighboring cells have to be examined for
 * determining the next frame's state for a given cell.
 */
function initCellLookup()
{
    // WE'LL PUT ALL THE VALUES IN HERE
    cellLookup = new Array();
    
    // TOP LEFT
    var topLeftArray        = new Array( 1, 0,  1,  1,  0,  1);
    cellLookup[TOP_LEFT]    = new CellType(3, topLeftArray);
    
    // TOP RIGHT
    var topRightArray       = new Array(-1, 0, -1,  1,  0,  1);
    cellLookup[TOP_RIGHT]   = new CellType(3, topRightArray);
    
    // BOTTOM LEFT
    var bottomLeftArray     = new Array( 1, 0,  1, -1, 0, -1);
    cellLookup[BOTTOM_LEFT] = new CellType(3, bottomLeftArray);
    
    // BOTTOM RIGHT
    var bottomRightArray    = new Array(-1, 0, -1, -1, 0, -1);
    cellLookup[BOTTOM_RIGHT]= new CellType(3, bottomRightArray);
    
    // TOP 
    var topArray            = new Array(-1, 0, -1, 1, 0, 1, 1, 1, 1, 0);
    cellLookup[TOP]         = new CellType(5, topArray);
    
    // BOTTOM
    var bottomArray         = new Array(-1, 0, -1, -1, 0, -1, 1, -1, 1, 0);
    cellLookup[BOTTOM]      = new CellType(5, bottomArray);

    // LEFT
    var leftArray           = new Array(0, -1, 1, -1, 1, 0, 1, 1, 0, 1);
    cellLookup[LEFT]        = new CellType(5, leftArray);

    // RIGHT
    var rightArray          = new Array(0, -1, -1, -1, -1, 0, -1, 1, 0, 1);
    cellLookup[RIGHT]       = new CellType(5, rightArray);
    
    // CENTER
    var centerArray         = new Array(-1, -1, -1, 0, -1, 1, 0, 1, 1, 1, 1, 0, 1, -1, 0, -1);
    cellLookup[CENTER]      = new CellType(8, centerArray);
}

/*
 * This method initializes all the patterns that the user
 * may put into the simulation. This is done by reading in
 * the images listed in the drop-down list, and then examining
 * the contents of those images, considering anything that is
 * not white as a "LIVE_CELL". Note that this allows us to
 * easily add any new image we like as a pattern.
 */
function initPatterns()
{
    // THIS IS WHERE ALL THE IMAGES SHOULD BE
    imgDir = "/img/";
    
    // THIS WILL STORE ALL THE PATTERNS IN AN ASSOCIATIVE ARRAY
    patterns = new Array();
    
    // GET THE DROP DOWN LIST
    var patternsList = document.getElementById("game_of_life_patterns");
    
    // GO THROUGH THE LIST AND LOAD ALL THE IMAGES
    for (var i = 0; i < patternsList.options.length; i++)
        {
            // GET THE NAME OF THE IMAGE FILE AND MAKE
            // A NEW ARRAY TO STORE IT'S PIXEL COORDINATES
            var key = patternsList.options[i].value;
            var pixelArray = new Array();
            
            // NOW LOAD THE DATA FROM THE IMAGE
            loadOffscreenImage(key, pixelArray);
            
            // AND PUT THE DATA IN THE ASSOCIATIVE ARRAY,
            // BY KEY
            patterns[key] = pixelArray;
        }
}

/*
 * This function initializes all the event handlers, registering
 * the proper response methods.
 */
function initEventHandlers()
{
    // WE'LL RESPOND TO MOUSE CLICKS ON THE CANVAS
    canvas.onclick = respondToMouseClick;

    //Respond to mouse movement on the canvas
    canvas.onmousemove = respondToMouseMove;

    //Record mouse movement for click and drag effect
    canvas.onmousedown = respondToMouseDown;
    canvas.onmouseup = respondToMouseUp;
    
    // AND ALL THE APP'S BUTTONS
    document.getElementById("start_button").onclick=startGameOfLife;
    document.getElementById("pause_button").onclick=pauseGameOfLife;
    document.getElementById("reset_button").onclick=resetGameOfLife;
    document.getElementById("dec_fps_button").onclick=decFPS;
    document.getElementById("inc_fps_button").onclick=incFPS;
    document.getElementById("dec_cell_length_button").onclick=decCellLength;
    document.getElementById("inc_cell_length_button").onclick=incCellLength;
}

/*
 * This function loads the image and then examines it, extracting
 * all the pixels and saving the coordinates that are non-white.
 */
function loadOffscreenImage(imgName, pixelArray)
{    
    // FIRST GET THE IMAGE DATA
    var img = new Image();
    
    // NOTE THAT THE IMAGE WILL LOAD IN THE BACKGROUND, BUT
    // WE CAN TELL JavaScript TO LET US KNOW WHEN IT HAS FULLY
    // LOADED AND RESPOND THEN.
    img.onload = function() { respondToLoadedImage(imgName, img, pixelArray); };
    
    // document.URL IS THE URL OF WHERE THE WEB PAGE IS FROM WHICH THIS
    // JavaScript PROGRAM IS BEING USED. NOTE THAT ASSIGNING A URL TO
    // A CONSTRUCTED Image's src VARIABLE INITIATES THE IMAGE-LOADING
    // PROCESS
    var path = document.URL;
    var indexLocation = path.indexOf("index.html");
    path = path.substring(0, indexLocation);
    img.src = path + imgDir + imgName;
}

// EVENT HANDLER METHODS

/*
 * This method is called in response to an Image having completed loading. We
 * respond by examining the contents of the image, and keeping the non-white
 * pixel coordinates in our patterns array so that the user may use those
 * patterns in the simulation.
 */
function respondToLoadedImage(imgName, img, pixelArray)
{
    // WE'LL EXAMINE THE PIXELS BY FIRST DRAWING THE LOADED
    // IMAGE TO AN OFFSCREEN CANVAS. SO FIRST WE NEED TO
    // MAKE THE CANVAS, WHICH WILL NEVER ACTUALLY BE VISIBLE.
    var offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = img.width;
    offscreenCanvas.height = img.height;
    var offscreenCanvas2D = offscreenCanvas.getContext("2d");
    offscreenCanvas2D.drawImage(img, 0, 0);
    
    // NOW GET THE DATA FROM THE IMAGE WE JUST DREW TO OUR OFFSCREEN CANVAS
    var imgData = offscreenCanvas2D.getImageData( 0, 0, img.width, img.height );
    
    // THIS WILL COUNT THE FOUND NON-WHITE PIXELS
    var pixelArrayCounter = 0;
   
    // GO THROUGH THE IMAGE DATA AND PICK OUT THE COORDINATES
    for (var i = 0; i < imgData.data.length; i+=4)
        {
            // THE DATA ARRAY IS STRIPED RGBA, WE'LL IGNORE 
            // THE ALPHA CHANNEL
            var r = imgData.data[i];
            var g = imgData.data[i+1];
            var b = imgData.data[i+2];
            
            // KEEP THE PIXEL IF IT'S NON-WHITE
            if ((r < 255) && (g < 255) && (b < 255))
                {
                    // CALCULATE THE LOCAL COORDINATE OF
                    // THE FOUND PIXEL. WE DO THIS BECAUSE WE'RE
                    // NOT KEEPING ALL THE PIXELS
                    var x = Math.floor((i/4)) % img.width;
                    var y = Math.floor(Math.floor((i/4)) / img.width);
                    
                    // STORE THE COORDINATES OF OUR PIXELS
                    pixelArray[pixelArrayCounter] = x;
                    pixelArray[pixelArrayCounter+1] = y;
                    pixelArrayCounter += 2;
                }            
        }    
}

var recordMouseArray;
var pressedDown;
function respondToMouseDown(event)
{
    recordMouseArray = new Array();
    pressedDown = true;
    // GET THE PATTERN SELECTED IN THE DROP DOWN LIST
    var patternsList = document.getElementById("game_of_life_patterns");
    var selectedPattern = patternsList.options[patternsList.selectedIndex].value;

    // CALCULATE THE ROW,COL OF THE CLICK
    var canvasCoords = getRelativeCoords(event);
    var clickCol = Math.floor(canvasCoords.x/cellLength);
    var clickRow = Math.floor(canvasCoords.y/cellLength);

    //If void cell is selected
    if(selectedPattern === "VoidCell.png") {

        // LOAD THE COORDINATES OF THE PIXELS TO DRAW
        var pixels = patterns[selectedPattern];

        for (var i = 0; i < pixels.length; i += 2) {
            var col = clickCol + pixels[i];
            var row = clickRow + pixels[i + 1];
            setGridCell(recordMouseArray, row, col, VOID_CELL);
        }

        brightFeedback(pixels, clickCol, clickRow, 1);

        respondToMouseMove;

    } else if(selectedPattern === "RemoveVoidCell.png"){
        // LOAD THE COORDINATES OF THE PIXELS TO DRAW
        var pixels = patterns[selectedPattern];

        for (var i = 0; i < pixels.length; i += 2) {
            var col = clickCol + pixels[i];
            var row = clickRow + pixels[i + 1];
            setGridCell(recordMouseArray, row, col, LIVE_CELL);
        }

        brightFeedback(pixels, clickCol, clickRow, 0);
    }
}

/*
 * This is the event handler for when the user clicks on the canvas,
 * which means the user wants to put a pattern in the grid at
 * that location.
 */
function respondToMouseClick(event)
{
    // GET THE PATTERN SELECTED IN THE DROP DOWN LIST
    var patternsList = document.getElementById("game_of_life_patterns");
    var selectedPattern = patternsList.options[patternsList.selectedIndex].value;
    
    // LOAD THE COORDINATES OF THE PIXELS TO DRAW
    var pixels = patterns[selectedPattern];

    // CALCULATE THE ROW,COL OF THE CLICK
    var canvasCoords = getRelativeCoords(event);
    var clickCol = Math.floor(canvasCoords.x/cellLength);
    var clickRow = Math.floor(canvasCoords.y/cellLength);

    // //If void cell is selected
    // if(selectedPattern === "VoidCell.png"){
    //     // GO THROUGH ALL THE PIXELS IN THE PATTERN AND PUT THEM IN THE GRID
    //     for (var i = 0; i < pixels.length; i += 2) {
    //         var col = clickCol + pixels[i];
    //         var row = clickRow + pixels[i + 1];
    //         setGridCell(renderGrid, row, col, VOID_CELL);
    //         setGridCell(updateGrid, row, col, VOID_CELL);
    //     }
    //     brightFeedback(pixels, clickCol, clickRow, 1);
    //     return;
    // }

    // //If remove void cell is selected
    // if(selectedPattern === "RemoveVoidCell.png"){
    //     // GO THROUGH ALL THE PIXELS IN THE PATTERN AND PUT THEM IN THE GRID
    //     for (var i = 0; i < pixels.length; i += 2) {
    //         var col = clickCol + pixels[i];
    //         var row = clickRow + pixels[i + 1];
    //         setGridCell(renderGrid, row, col, LIVE_CELL);
    //         setGridCell(updateGrid, row, col, LIVE_CELL);
    //     }
    //     brightFeedback(pixels, clickCol, clickRow, 0);
    //     return;
    // }

    // GO THROUGH ALL THE PIXELS IN THE PATTERN AND PUT THEM IN THE GRID
    for (var i = 0; i < pixels.length; i += 2) {
        var col = clickCol + pixels[i];
        var row = clickRow + pixels[i + 1];
        setGridCell(renderGrid, row, col, LIVE_CELL);
        setGridCell(updateGrid, row, col, LIVE_CELL);
    }

    brightFeedback(pixels, clickCol, clickRow, 0);
}

/*
 * This is the event listener for when the user selects a pattern
 * from the list and moves the mouse over the grid it shows a semi-
 * transparent shape.
 */
function respondToMouseMove(event)
{
    resetGhostCanvas();
    // GET THE PATTERN SELECTED IN THE DROP DOWN LIST
    var patternsList = document.getElementById("game_of_life_patterns");
    var selectedPattern = patternsList.options[patternsList.selectedIndex].value;

    // LOAD THE COORDINATES OF THE PIXELS
    var pixels = patterns[selectedPattern];

    // CALCULATE THE ROW,COL OF THE MOUSE
    var canvasCoords = getRelativeCoords(event);
    var mouseCol = Math.floor(canvasCoords.x/cellLength);
    var mouseRow = Math.floor(canvasCoords.y/cellLength);

    if(selectedPattern === "VoidCell.png"){
        //GO THROUGH ALL THE PIXELS IN THE PATTERN AND PUT THEM IN THE GRID
        if(pressedDown === true){
            for (var i = 0; i < pixels.length; i += 2)
            {
                var col = mouseCol + pixels[i];
                var row = mouseRow + pixels[i+1];
                setGridCell(recordMouseArray, row, col, VOID_CELL);
            }
            brightFeedback(pixels, mouseCol, mouseRow, 1);
        }
    } else if(selectedPattern === "RemoveVoidCell.png"){
        //GO THROUGH ALL THE PIXELS IN THE PATTERN AND PUT THEM IN THE GRID
        if(pressedDown === true){
            for (var i = 0; i < pixels.length; i += 2)
            {
                var col = mouseCol + pixels[i];
                var row = mouseRow + pixels[i+1];
                setGridCell(recordMouseArray, row, col, LIVE_CELL);
            }
            brightFeedback(pixels, mouseCol, mouseRow, 0);
        }
    }

    //GO THROUGH ALL THE PIXELS IN THE PATTERN AND PUT THEM IN THE GRID
    for (var i = 0; i < pixels.length; i += 2)
    {
        var col = mouseCol + pixels[i];
        var row = mouseRow + pixels[i+1];
        setGridCell(ghostRenderGrid, row, col, GHOST_CELL);
        setGridCell(ghostUpdateGrid, row, col, GHOST_CELL);
    }

    // RENDER THE GHOST CELLS
    renderGhostCells();
}

function respondToMouseUp(event){
    // GET THE PATTERN SELECTED IN THE DROP DOWN LIST
    var patternsList = document.getElementById("game_of_life_patterns");
    var selectedPattern = patternsList.options[patternsList.selectedIndex].value;

    // LOAD THE COORDINATES OF THE PIXELS
    var pixels = patterns[selectedPattern];

    // CALCULATE THE ROW,COL OF THE MOUSE
    var canvasCoords = getRelativeCoords(event);
    var mouseCol = Math.floor(canvasCoords.x/cellLength);
    var mouseRow = Math.floor(canvasCoords.y/cellLength);

    if(selectedPattern === "VoidCell.png"){
        if(pressedDown === true){
            //GO THROUGH ALL THE PIXELS IN THE PATTERN AND PUT THEM IN THE GRID
            for (var i = 0; i < pixels.length; i += 2)
            {
                var col = mouseCol + pixels[i];
                var row = mouseRow + pixels[i+1];
                setGridCell(recordMouseArray, row, col, VOID_CELL);
            }
            brightFeedback(pixels, mouseCol, mouseRow, 1);
            pressedDown = false;
        }
    } else if(selectedPattern === "RemoveVoidCell.png") {
        if (pressedDown === true) {
            //GO THROUGH ALL THE PIXELS IN THE PATTERN AND PUT THEM IN THE GRID
            for (var i = 0; i < pixels.length; i += 2) {
                var col = mouseCol + pixels[i];
                var row = mouseRow + pixels[i + 1];
                setGridCell(recordMouseArray, row, col, LIVE_CELL);
            }
            brightFeedback(pixels, mouseCol, mouseRow, 0);
            pressedDown = false;
        }
    }
}

/*
 * This function starts the simulation. Note that we don't want multiple
 * threads doing the same thing, so we first close the current thread, if
 * there is one. Once this method is called, the update and render are done
 * on a timed basis.
 */
function startGameOfLife()
{
    // CLEAR OUT ANY OLD TIMER
    if (timer !== null)
        {
            clearInterval(timer);
        }
        
    // START A NEW TIMER
    timer = setInterval(stepGameOfLife, frameInterval);
}

/*
 * This function pauses the simulation such that the update and render
 * are no longer called on a timed basis.
 */
function pauseGameOfLife()
{
    // TELL JavaScript TO STOP RUNNING THE LOOP
    clearInterval(timer);
    
    // AND THIS IS HOW WE'LL KEEP TRACK OF WHETHER
    // THE SIMULATION IS RUNNING OR NOT
    timer = null;
}

/*
 * This function resets the grid containing the current state of the
 * Game of Life such that all cells in the game are dead.
 */
function resetGameOfLife()
{
    // RESET ALL THE DATA STRUCTURES TOO
    gridWidth = canvasWidth/cellLength;
    gridHeight = canvasHeight/cellLength;
    updateGrid = new Array();
    renderGrid = new Array();
    
    // INIT THE CELLS IN THE GRID
    for (var i = 0; i < gridHeight; i++)
        {
            for (var j = 0; j < gridWidth; j++)
                {
                    setGridCell(updateGrid, i, j, DEAD_CELL); 
                    setGridCell(renderGrid, i, j, DEAD_CELL);
                }
        }

    // RENDER THE CLEARED SCREEN
    renderGame();
}

/*
 * This resets the ghost canvas so that it doesn't stay on the
 * ghost grid. Makes it have the single image following mouse
 * effect
 */
function resetGhostCanvas(){
    ghostRenderGrid = new Array();
    ghostUpdateGrid = new Array();

    // INIT THE CELLS IN THE GRID
    for (var i = 0; i < gridHeight; i++)
    {
        for (var j = 0; j < gridWidth; j++)
        {
            setGridCell(ghostUpdateGrid, i, j, DEAD_CELL);
            setGridCell(ghostRenderGrid, i, j, DEAD_CELL);
        }
    }

    // CLEAR THE CANVAS
    ghostCanvas2D.clearRect(0, 0, canvasWidth, canvasHeight);
    swapGhostGrids();
    renderGhostCells();
}

/*
 * This function decrements the frames per second used by the
 * the simulation.
 */
function decFPS()
{
    // WE CAN'T HAVE A FRAME RATE OF 0 OR LESS
    if (fps > MIN_FPS)
        {
            // UPDATE THE FPS
            fps -= FPS_INC;
            frameInterval = 1000/fps;
            
            // IF A SIMULATION IS ALREADY RUNNING,
            // RESTART IT WITH THE NEW FRAME RATE
            if (timer !== null)
                {
                    startGameOfLife();
                } 
            // OTHERWISE WE NEED TO RENDER A FRAME OURSELVES
            else
                {
                    renderGame();
                }
        }
}

/*
 * This function increments the frames per second used by the
 * the simulation. 
 */
function incFPS()
{
    // WE'LL CAP THE FRAME RATE AT 33
    if (fps < MAX_FPS)
        {
            // UPDATE THE FPS
            fps += FPS_INC;
            frameInterval = MILLISECONDS_IN_ONE_SECOND/fps;
            
            // IF A SIMULATION IS ALREADY RUNNING,
            // RESTART IT WITH THE NEW FRAME RATE
            if (timer !== null)
                {
                    startGameOfLife();
                }
            // OTHERWISE WE NEED TO RENDER A FRAME OURSELVES
            else
                {
                    renderGame();
                }
        }
}

/*
 * This function decrements the cellLength factor for rendering. Note the 
 * cellLength starts at 1, which is cellLengthed all the way out, where cells are
 * on a one-to-one ratio with pixels in the canvas. The numeric value
 * of the cellLength translates into the length of each side for each cell.
 */
function decCellLength()
{
    // 1 IS THE LOWEST VALUE WE ALLOW
    if (cellLength > MIN_CELL_LENGTH)
        {
            // DEC THE CELL LENGTH
            cellLength /= CELL_LENGTH_INC;
            
            // AND RESET THE DATA STRUCTURES
            resetGameOfLife();
           
            // IF WE DON'T HAVE AN UPDATE/RENDER LOOP
            // RUNNING THEN WE HAVE TO FORCE A ONE-TIME
            // RENDERING HERE
            if (timer === null)
                {
                    renderGame();
                }
    }
}

/*
 * This function increments the cellLength factor for rendering. Note the 
 * cellLength starts at 1, which is cellLengthed all the way out, where cells are
 * on a one-to-one ratio with pixels in the canvas. The numeric value
 * of the cellLength translates into the length of each side for each cell.
 */
function incCellLength()
{
    // 100 IS THE LARGEST VALUE WE ALLOW
    if (cellLength < MAX_CELL_LENGTH)
        {
            // INC THE CELL LENGTH
            cellLength *= CELL_LENGTH_INC;
            
            // AND RESET THE DATA STRUCTURES
            resetGameOfLife();
            
            // IF WE DON'T HAVE AN UPDATE/RENDER LOOP
            // RUNNING THEN WE HAVE TO FORCE A ONE-TIME
            // RENDERING HERE
            if (timer === null)
                {
                    renderGame();
                }
        }
}

// HELPER METHODS FOR THE EVENT HANDLERS

/*
 * This function gets the mouse click coordinates relative to
 * the canvas itself, where 0,0 is the top, left corner of
 * the canvas.
 */
function getRelativeCoords(event) 
{
    if (event.offsetX !== undefined && event.offsetY !== undefined) 
    { 
        return { x: event.offsetX, y: event.offsetY }; 
    }
    else
    {
        return { x: event.layerX, y: event.layerY };
    }
}

// GRID CELL MANAGEMENT METHODS

/*
 * This function tests to see if (row, col) represents a 
 * valid cell in the grid. If it is a valid cell, true is
 * returned, else false.
 */
function isValidCell(row, col)
{
    // IS IT OUTSIDE THE GRID?
    if (    (row < 0) || 
            (col < 0) ||
            (row >= gridHeight) ||
            (col >= gridWidth))
        {
            return false;
        }
    // IT'S INSIDE THE GRID
    else
        {
            return true;
        }
}

/*
 * Accessor method for getting the cell value in the grid at
 * location (row, col).
 */
function getGridCell(grid, row, col)
{
    // IGNORE IF IT'S OUTSIDE THE GRID
    if (!isValidCell(row, col))
        {
            return -1;
        }
    var index = (row * gridWidth) + col;
    return grid[index];
}

/*
 * Mutator method for setting the cell value in the grid at
 * location (row, col).
 */
function setGridCell(grid, row, col, value)
{
    // IGNORE IF IT'S OUTSIDE THE GRID
    if (!isValidCell(row, col))
        {
            return;
        }
    var index = (row * gridWidth) + col;
    grid[index] = value;
}

/*
 * A cell's type determines which adjacent cells need to be tested
 * during each frame of the simulation. This method tests the cell
 * at (row, col), and returns the constant representing which of
 * the 9 different types of cells it is.
 */
function determineCellType(row, col)
{
    if ((row === 0) && (col === 0))                                 return TOP_LEFT;
    else if ((row === 0) && (col === (gridWidth-1)))                return TOP_RIGHT;
    else if ((row === (gridHeight-1)) && (col === 0))               return BOTTOM_LEFT;
    else if ((row === (gridHeight-1)) && (col === (gridHeight-1)))  return BOTTOM_RIGHT;
    else if (row === 0)                                             return TOP;
    else if (col === 0)                                             return LEFT;
    else if (row === (gridHeight-1))                                return RIGHT;
    else if (col === (gridWidth-1))                                 return BOTTOM;
    else                                                            return CENTER;
}

/*
 * This method counts the living cells adjacent to the cell at
 * (row, col). This count is returned.
 */
function calcLivingNeighbors(row, col)
{
    var numLivingNeighbors = 0;
    
    // DEPENDING ON THE TYPE OF CELL IT IS WE'LL CHECK
    // DIFFERENT ADJACENT CELLS
    var cellType = determineCellType(row, col);
    var cellsToCheck = cellLookup[cellType];
    for (var counter = 0; counter < (cellsToCheck.numNeighbors * 2); counter+=2)
        {
            var neighborCol = col + cellsToCheck.cellValues[counter];
            var neighborRow = row + cellsToCheck.cellValues[counter+1];
            var index = (neighborRow * gridWidth) + neighborCol;
            var neighborValue = updateGrid[index];

            //if the neighbor is void... treat it as dead
            if(neighborValue === 3){
                neighborValue = 0;
            }

            numLivingNeighbors += neighborValue;
        }
    return numLivingNeighbors;
}

/*
 * Called each frame on a timed basis, this method updates the grid
 * and renders the simulation.
 */
function stepGameOfLife()
{
    // FIRST PERFORM GAME LOGIC
    updateGame();

    // RENDER THE GAME
    renderGame();
}

/*
 * This function is called each frame of the simulation and
 * it tests and updates each cell according to the rules
 * of Conway's Game of Life.
 */
function updateGame()
{
    // GO THROUGH THE UPDATE GRID AND USE IT TO CHANGE THE RENDER GRID
    for (var i = 0; i < gridHeight; i++)
        {
            for (var j = 0; j < gridWidth; j++)
                {
                    // HOW MANY NEIGHBORS DOES THIS CELL HAVE?
                    var numLivingNeighbors = calcLivingNeighbors(i, j);

                    // CALCULATE THE ARRAY INDEX OF THIS CELL
                    // AND GET ITS CURRENT STATE
                    var index = (i * gridWidth) + j;
                    var testCell = updateGrid[index];

                    // CASES
                    // 1) IT'S ALIVE
                    if (testCell === LIVE_CELL)
                        {
                            // 1a FEWER THAN 2 LIVING NEIGHBORS
                            if (numLivingNeighbors < 2)
                                {
                                    // IT DIES FROM UNDER-POPULATION
                                    renderGrid[index] = DEAD_CELL;
                                }
                            // 1b MORE THAN 3 LIVING NEIGHBORS
                            else if (numLivingNeighbors > 3)
                                {
                                    // IT DIES FROM OVERCROWDING
                                    renderGrid[index] = DEAD_CELL;
                                }
                            // 1c 2 OR 3 LIVING NEIGHBORS, WE DO NOTHING
                            else
                                {
                                    renderGrid[index] = LIVE_CELL;
                                }
                        }
                    // 2) IT'S DEAD/VOID
                   else if (numLivingNeighbors === 3)
                       {
                           //if it's void.. keep it void
                           if(testCell === VOID_CELL){
                               renderGrid[index] = VOID_CELL;
                           } else {
                               renderGrid[index] = LIVE_CELL;
                           }

                       }                    
                   else
                       {
                           //if it's void.. keep it void
                           if(testCell === VOID_CELL){
                               renderGrid[index] = VOID_CELL;
                           } else {
                               renderGrid[index] = DEAD_CELL;
                           }
                       }
                }
        } 
}

/*
 * This function renders a single frame of the simulation, including
 * the grid itself, as well as the text displaying the current
 * fps and cellLength levels.
 */
function renderGame()
{
    // CLEAR THE CANVAS
    canvas2D.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // RENDER THE GRID LINES, IF NEEDED
    if (cellLength >= GRID_LINE_LENGTH_RENDERING_THRESHOLD)
        renderGridLines();

    // RENDER THE GAME CELLS
    renderCells();
    
    // AND RENDER THE TEXT
    renderText();
    
    // THE GRID WE RENDER THIS FRAME WILL BE USED AS THE BASIS
    // FOR THE UPDATE GRID NEXT FRAME
    swapGrids();
}

/*
 * Renders the cells in the game grid, with only the live
 * cells being rendered as filled boxes. Note that boxes are
 * rendered according to the current cell length.
 */
function renderCells()
{
    // RENDER THE LIVE CELLS IN THE GRID
    for (var i = 0; i <= gridHeight; i++)
        {
           for (var j = 0; j < gridWidth; j++)
               {
                   var cell = getGridCell(renderGrid, i, j);
                   if (cell === LIVE_CELL)
                       {
                           // SET THE PROPER RENDER COLOR
                           canvas2D.fillStyle = LIVE_COLOR;
                           var x = j * cellLength;
                           var y = i * cellLength;
                           canvas2D.fillRect(x, y, cellLength, cellLength);
                       }
                   //If void cell, change the color
                   if(cell === VOID_CELL){
                       // SET THE PROPER RENDER COLOR
                       canvas2D.fillStyle = VOID_COLOR;
                       var x = j * cellLength;
                       var y = i * cellLength;
                       canvas2D.fillRect(x, y, cellLength, cellLength);
                   }
               }
        }      
}

/*
 * Sets Bright cells to make the bright feedback functionality
 */
function brightFeedback(pixels, clickCol, clickRow, voidFlag)
{
    for (var i = 0; i < pixels.length; i += 2) {
        var col = clickCol + pixels[i];
        var row = clickRow + pixels[i + 1];
        setGridCell(renderGrid, row, col, BRIGHT_CELL);
        setGridCell(updateGrid, row, col, BRIGHT_CELL);
    }

    //Render the bright cells for one frame and then next
    //tick will render the game
    if(voidFlag){
        renderBrightCells(1);
    } else {
        renderBrightCells(0);
    }
}

/*
 * Renders the bright cells on the grid
 * Takes in a flag to check if the cells are void
 */
function renderBrightCells(voidFlag){
    // SET THE PROPER RENDER COLOR
    canvas2D.fillStyle = BRIGHT_COLOR;

    // RENDER THE LIVE CELLS IN THE GRID
    for (var i = 0; i <= gridHeight; i++)
    {
        for (var j = 0; j < gridWidth; j++)
        {
            var cell = getGridCell(renderGrid, i, j);
            if (cell === BRIGHT_CELL)
            {
                var x = j * cellLength;
                var y = i * cellLength;
                canvas2D.fillRect(x, y, cellLength, cellLength);
                if(voidFlag){
                    setGridCell(renderGrid, i, j, VOID_CELL);
                    setGridCell(updateGrid, i, j, VOID_CELL);
                } else {
                    setGridCell(renderGrid, i, j, LIVE_CELL);
                    setGridCell(updateGrid, i, j, LIVE_CELL);
                }
            }
        }
    }
}

/*
 * Renders the ghost cells in the ghost grid. It takes in a
 * fillColor because this is where I do the bright feedback when
 * the user clicks.
 */
function renderGhostCells()
{
    // SET THE PROPER RENDER COLOR
    ghostCanvas2D.fillStyle = GHOST_COLOR;

    // RENDER THE GHOST CELLS IN THE GRID
    for (var i = 0; i <= gridHeight; i++)
    {
        for (var j = 0; j < gridWidth; j++)
        {
            var cell = getGridCell(ghostRenderGrid, i, j);
            if (cell === GHOST_CELL)
            {
                var x = j * cellLength;
                var y = i * cellLength;
                ghostCanvas2D.fillRect(x, y, cellLength, cellLength);
            }
        }
    }
}

/*
 * Renders the text on top of the grid.
 */
function renderText()
{
    // SET THE PROPER COLOR
    canvas2D.fillStyle = TEXT_COLOR;
    
    // RENDER THE TEXT
    canvas2D.fillText("FPS: " + fps, FPS_X, FPS_Y);
    canvas2D.fillText("Cell Length: " + cellLength, CELL_LENGTH_X, CELL_LENGTH_Y);
}

/*
 * Renders the grid lines.
 */
function renderGridLines()
{
    // SET THE PROPER COLOR
    canvas2D.strokeStyle = GRID_LINES_COLOR;

    // VERTICAL LINES
    for (var i = 0; i < gridWidth; i++)
        {
            var x1 = i * cellLength;
            var y1 = 0;
            var x2 = x1;
            var y2 = canvasHeight;
            canvas2D.beginPath();
            canvas2D.moveTo(x1, y1);
            canvas2D.lineTo(x2, y2);
            canvas2D.stroke();
        }
        
    // HORIZONTAL LINES
    for (var j = 0; j < gridHeight; j++)
        {
            var x1 = 0;
            var y1 = j * cellLength;
            var x2 = canvasWidth;
            var y2 = y1;
            canvas2D.moveTo(x1, y1);
            canvas2D.lineTo(x2, y2);
            canvas2D.stroke();            
        }
}

/*
 * We need one grid's cells to determine the grid's values for
 * the next frame. So, we update the render grid based on the contents
 * of the update grid, and then, after rending, we swap them, so that
 * the next frame we'll be progressing the game properly.
 */
function swapGrids()
{
    var temp = updateGrid;
    updateGrid = renderGrid;
    renderGrid = temp;
}

function swapGhostGrids(){
    var temp = ghostUpdateGrid;
    ghostUpdateGrid = ghostRenderGrid;
    ghostRenderGrid = temp;
}