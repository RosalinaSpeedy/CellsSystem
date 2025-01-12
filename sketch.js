/**
 * Ben Craddock - 33733570
 */

/*

-In this particular js file I have added a pyramid structure/sculpture as well as a separate list of objects that attract cells.
-None of my additions require any extra input from the user.
-When all cells are dead - everything within the main sphere will disappear.

*/

let cells = []; // array of cells objects
let attractors = []; //array of objects that attract other cells

/**
 * createCellsArray()
 * -Fills the cells[] array with new objects
 * @param {Integer} maxCells Number of cells for the new array
 * @returns {Array} array of new Cells objects 
 */
function createCellsArray(maxCells) {
    //better drawing: cells have different types selected randomly:
    let types = ["cylinder", "cone", "torus", "sphere", "box"]; //establish possible cell types
    
    let tempCells = []; //create empty array to populate
    for (var i = 0; i < maxCells; i++){ //loop up to max number
        tempCells.push(new Cell( //create a new, random cell
            {
                position: p5.Vector.random3D().mult(width / 4), 
                diameter: random(20, 40),
                velocity: p5.Vector.random3D(),
                life: random(400, 800),
                type: types[Math.floor(Math.random() * 5)],
                rotate: Math.random(-0.000001, 0)
            }
        ));
    }
    return tempCells; //return cells array
}

//creating objects that attract cells:

/**
 * createAttractorArray()
 * -Fills the attractors[] array with new objects
 * @param {Integer} maxCells Number of attractors for the new array
 * @returns {Array} array of new attractor objects (borrows from Cell object logic)
 */
function createAttractorArray(maxCells) {
    let tempCells = []; //empty array to add to
    for (var i = 0; i < maxCells; i++){
        tempCells.push(new Cell( //add "maxCells" number of random attractors
            {
                position: p5.Vector.random3D().mult(width / 4), 
                diameter: random(20, 40),
                type: "sphere",
            }
        ));
    }
    return tempCells; //return cells array
}

/**
 * drawCells3D(cellsArray)
 * draw each of the cells/attractors in the passed array to the screen
 * @param {Array} cellsArray Array of Cell objects to draw 
 */
function drawCells3D(cellsArray) {
    for (let cell of cellsArray){ //Loop through the cells array, for each cell:
        //only update (move) the cells if they arent attractors and there is at least one living cell
        if (cellsArray !== attractors && cells.length > 0){
            cell.update();
        }
        else if (cells.length == 0){
            attractors = []; //remove all attractors if there are no cells to atract
        }
        
        //draw cells to the screen:
        push();
        translate(cell.getPosition()); //move drawing state to the vector position of cell
        if (cellsArray !== attractors || cells.length < 1){ //ensures attractors flash with colour before dying
            fill(cell.getColour()); //add the colour
        }
        else{
            fill(0); //attractors will be filled pure black to distinguish them
        }
        
        //add some animation to the cells - rotate them by a proportion of their designated rotate value
        rotateZ(millis() * cell.getRotate() / 8);
        rotateX(millis() * cell.getRotate() / 8);
        rotateY(millis() * cell.getRotate() / 8);
        
        //draw the cell to the screen in the appropriate shape according to its type property:
        switch(cell.getType()){
            case "sphere":
                sphere(cell.getDiameter());
                break;
            case "torus":
                torus(cell.getDiameter());
                break;
            case "cylinder":
                cylinder(cell.getDiameter());
                break;
            case "cone":
                cone(cell.getDiameter());
                break;
            case "box":
                box(cell.getDiameter());
                break;
            default:
                plane(cell.getDiameter());
                break;
        }
        pop(); //return to default drawing state
    }
}

/**
 * checkCollisions(cell1, cell2) - Check collision between cell1 and cell2
 * @param {Cell} cell1 
 * @param {Cell} cell2 
 * @returns {Boolean} true if collided otherwise false
 */
function checkCollision(cell1, cell2) {
    //function returns true if the cells overlap - as in if the distance between them is less than the sum of their diameters:
    if (p5.Vector.dist(cell1.getPosition(), cell2.getPosition()) < cell1.getDiameter() + cell2.getDiameter()){
        return true;
    }
    return false;
}

/**
 * collideCells() - Collide two cells together
 * @param {Array} cellsArray Array of Cell objects to check collisions between elements 
 */
function collideCells(cellsArray) {
    // loop through the array
    for (let cell1 of cellsArray) {
        for (let cell2 of cellsArray) {
            if (cell1 !== cell2) // don't collide with itself
            {
                if (checkCollision(cell1, cell2)) {
                    // get direction of collision, from cell2 to cell1
                    let collisionDirection = p5.Vector.sub(cell1.getPosition(), cell2.getPosition()).normalize();
                    
                    //collisions and repelling:
                    //Changed repelling physics slightly as an experiment - now applies a random force
                    cell2.applyForce(collisionDirection.mult(random(-0.2, -0.7))); //apply backward force
                    cell1.applyForce(collisionDirection.mult(random(-0.2, -0.7)));
                    //reverse the direction of rotation upon collision:
                    cell1.setRotate(cell1.getRotate() * -1);
                    cell2.setRotate(cell2.getRotate() * -1);
                }
            }
        }
    }
}

/**
 * attractCells() - attract cells to attractor spheres
 * @param {Array} cellsArray Array of Cell objects to check attraction threshold between elements 
 */
function attractCells(cellsArray, attractorArray){
    for (let attractor of attractorArray){ //loop over both arrays and check proximity
        for (let cell of cellsArray){
            if (checkCollision(attractor, cell)){
                let collisionDirection = p5.Vector.sub(attractor.getPosition(), cell.getPosition()).normalize();
                
                //applying force >1 will attract cells
                attractor.applyForce(collisionDirection.mult(-1.5)); //apply attracted force
                cell.applyForce(collisionDirection.mult(-1.5));
            }
        }
    }
}

/**
 * constrainCells(cellsArray, worldCenterPos, worldDiameter) - Constrain cells to sphere world boundaries.
 * @param {Array} cellsArray Array of Cell objects to constrain 
 */
function constrainCells(cellsArray, worldCenterPos, worldDiameter) {
    //loop through the array
    for (let cell of cellsArray) {
        cell.constrainToSphere(worldCenterPos, worldDiameter);
    }
}

/**
 * getAlive(cellsArray) - filters out dead cells from the array
 * @param {Array} cellsArray Array of Cell objects to filter
 */
function getAlive(cellsArray){
    for (let cell of cellsArray){ //loop over array
        if (cell.getLife() < 4){ //if a cell is about to die (3 frames, therefore a max of 6 clones - 2 most likely):
            
            //crash prevention:
            //cap the cells at 40 (worst case as 46) - chance of splitting the cell into two children for every 95 < n < 100
            if (random(1, 100) > 95 && cells.length < 41){
                mitosis(cell); //split the cell
            }
        }
    }
    
    //remove all cells that are dead from the array by only keeping the ones with non-zero life
    cellsArray = cellsArray.filter(cell => isAlive(cell) === true);
    return cellsArray; //return filtered array
}

/**
 * isAlive(cell) - returns whether or not the cell passed has life property above 0
 * @param {Array} cell - cell to check the life of
 */
function isAlive(cell){
    if (cell.getLife() > 0){
        return true; //return true if the cell passed isn't dead
    }
    return false;
}

/**
 * mitosis(parent) - splits the parent cell into two children
 * @param {Array} parent - the cell to be split
 */
function mitosis(parent){
    //redefine local types
    let types = ["cylinder", "cone", "torus", "sphere", "box"];
    
    let childCell1 = new Cell({ //generate two random child cells
        position: parent.getPosition(),
        diameter: min(parent.getDiameter(), random(20, 40)),
        velocity: p5.Vector.random3D(),
        life: random(400, 800),
        type: types[Math.floor(Math.random() * 5)],
        rotate: Math.random(-0.01, 0.01)
    })
    let childCell2 = new Cell({
        position: parent.getPosition(),
        diameter: random(20, 40),
        velocity: p5.Vector.random3D(),
        life: random(400, 800),
        type: types[Math.floor(Math.random() * 5)],
        rotate: Math.random(-0.01, 0.01)
    })
    
    //push the child cells to the main array to be drawn to the canvas
    cells.push(childCell1);
    cells.push(childCell2);
}

/**
 * drawSculpture() - draws the spinning pyramid sculpture in the centre of the world
 */
function drawSculpture(){
    push(); //push a new drawing state so the rotation only affects the sculpture
    angleMode(DEGREES); //change angle mode for ease of calculation
    rotateX(80); //rotate x slightly so all dimensions of the pyramid are visible
    rotateZ(millis() / 40); //rotate the pyramid around the z axis continually
    
    var layerMax = 4; //max number of layers to the pyramid - base cubes are equal to (layerMax * 2) + 1
    for (var layer = -4; layer <= 4; layer++){ //loop over the number of layers (z dimension)
        for (var i = layer; i <= layerMax; i++){ //loop over for x and y, reduce size of layer square accordingly
            for (var j = layer; j <= layerMax; j++){
                push(); //new drawing state
                translate(22 * i, 22 * j, 22 * layer); //move to layer square position accordingly
                normalMaterial(); //setnormal material - distinguish from other objects
                box(16); //box with diameter 16 - makes the pyramid slightly see-through
                pop(); //return to previous drawing state
            }
        }
        layerMax--; //reduce layer size - ensures pyramid tapers to a point as layerMax tends to 0
    }
    pop(); //return to default drawing state
}

/**
 * Setup function
 */
function setup() {
    createCanvas(800, 600, WEBGL); //create canvas space
    
    //test cell exercise - left in for proof of completion
    
    // Exercise 1: test out the constructor function.
    // What should you see printed in the console if successful?
    let testCell = new Cell({
        position: createVector(1, 2, 3),
        velocity: createVector(-1, -2, -3),
        life: 600,
        diameter: 35
    });
    
    //create array of cells and attractors:
    cells = createCellsArray(35);
    attractors = createAttractorArray(7);
    
}

//draw function
function draw() {
    orbitControl(); // camera control using mouse
    
    //light functions:
    directionalLight(180, 180, 180, 0, 0, -width / 2);
    directionalLight(255, 255, 255, 0, 0, width / 2);
    ambientLight(60);
    pointLight(200, 200, 200, 0, 0, 0, 50);
    
    //draw the sculpture and refresh canvas
    noStroke();
    background(80); // clear screen
    if (cells.length > 0){ //draw the sculpture if there are still cells alive
        drawSculpture();
    }
    
    fill(220);
    ambientMaterial(80, 202, 94); // brown material
    cells = getAlive(cells); //refresh cells array to remove dead cell objects
    
    collideCells(cells); // handle collisions
    attractCells(cells, attractors); //handle attractions
    
    constrainCells(cells, createVector(0, 0, 0), width); // keep cells in the world
    drawCells3D(cells); //draw the cells 
    
    ambientMaterial(90, 90, 94); //dark material
    drawCells3D(attractors); //draw the attractors objects
    
    //draw world boundaries
    ambientMaterial(255, 102, 94); // magenta material for subsequent objects
    sphere(width); // this is the border of the world, like a "skybox"
}