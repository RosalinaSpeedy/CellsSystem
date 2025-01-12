/**
 * Ben Craddock - 33733570
 */

/*

-In this particular js file I have added a mitosis function which can create 2-6 more cells from a dying cell.
-I have also added rotation animations as well as drawing the cells on a scale from red to green as they age.
-The force at which cells ricochet off of one another is also somewhat random - and increases variability in object movement.
-None of my additions require any extra input from the user.

*/

/**
 * @param {Object} (optional) position, velocity, diameter, life, rotate, colour properties
 */
function Cell({position, velocity, diameter, life, type, rotate, colour}) {
    if (position === undefined) { // if it wasn't passed in
        // create default vector
        this._position = createVector(0, 0, 0);
    }
    else this._position = position; // use object property passed in
    if (velocity === undefined) { // if it wasn't passed in
        this._velocity = createVector(1, 1, 1);
    }
    else this._velocity = velocity; // use object property passed in
    if (diameter === undefined) { // if it wasn't passed in
        this._diameter = 1;
    }
    else this._diameter = diameter; // use object property passed in
    if (life === undefined) { // if it wasn't passed in
        this._life = 100;
    }
    else this._life = life; // use object property passed in
    if (type === undefined) { // if it wasn't passed in
        this._type = "sphere";
    }
    else this._type = type; // use object property passed in
    if (rotate === undefined) { // if it wasn't passed in
        this._rotate = 0.01;
    }
    else this._rotate = rotate; // use object property passed in
    if (colour === undefined) { // if it wasn't passed in
        this._colour = color(0, 255, 0);
    }
    else this._colour = colour; // use object property passed in

    // current instantaneous acceleration
    this._acceleration = createVector(0, 0, 0);
    
    /**
     * @param {p5.Vector, Array, or Number} force Force (3D) to apply to this object.
     */
    this.applyForce = function (force) {
        if (force !== undefined) {
            this._acceleration.add(force);
        }
    }
    
    /**
     * Internal use only. Apply current acceleration.
     */
    this._accelerate = function () {
        this._velocity.add(this._acceleration);
        this._acceleration.mult(0); // remove acceleration
    }
    
    /**
     * update()
     * This function actually updates the position by accelerating and applying the velocity.
     * @param {Number} friction An optional amount of friction to slow this down by, default is none (0)
     */
    this.update = function (friction = 1) {
        this._accelerate(); //add current accelleration 
        
        //move the current position of the cll by its velocity:
        this.setPosition(p5.Vector.add(this.getVelocity(), this.getPosition()));
        
        //cell ageing: if one can be removed from the cell life then age the cell by one; otherwise kill it:
        if (this.getLife() - 1 > 0){
            this.setLife(this.getLife() - 1);
        }
        else{
            this.setLife(0);
        }
        
        //cell ageing: draw cells differently with age - colour goes from green to red as the cell ages
        let tempColourValR = map(this.getLife(), 400, 800, 255, 0); //map life to a Red value where 0 < R < 255
        this.setColour(color(tempColourValR, 255 - tempColourValR, 0)); //scale from red to green accordingly
        
        //cell ageing: cells slowdown by a proportion of the friction value as they age
        let tempVel = this.getVelocity().setMag(this.getVelocity().mag() - friction / 850);
        this.setVelocity(tempVel); //velocity is updated accordingly to slow the cell down
    }
    
    //set/get functions
    /**
     * Set position safely.
     */
    this.setPosition = function (position) {
        this._position = position;
    }
    /**
     * Get position safely.
     */
    this.getPosition = function () {
        return this._position;
    }
    
    /**
     * Set diameter safely.
     */
    this.setDiameter = function (diameter) {
        this._diameter = diameter;
    }
    /**
     * Get diamter safely.
     */
    this.getDiameter = function () {
        return this._diameter;
    }
    
    /**
     * Set velocity safely.
     */
    this.setVelocity = function (velocity) {
        this._velocity = velocity;
    }
    /**
     * Get velocity safely.
     */
    this.getVelocity = function () {
        return this._velocity;
    }
    
    //cell ageing: created functions to get and set life appropriately
    /**
     * Set life safely.
     */
    this.setLife = function (life) {
        this._life = life;
    }
    /**
     * Get life safely.
     */
    this.getLife = function () {
        return this._life;
    }
    
    /**
     * Set type safely.
     */
    this.setType = function (type) {
        this._type = type;
    }
    /**
     * Get type safely.
     */
    this.getType = function () {
        return this._type;
    }
    
    /**
     * Set rotate safely.
     */
    this.setRotate = function (rotate) {
        this._rotate = rotate;
    }
    /**
     * Get rotate safely.
     */
    this.getRotate = function () {
        return this._rotate;
    }
    
    /**
     * Set colour safely.
     */
    this.setColour = function (colour) {
        this._colour = colour;
    }
    /**
     * Get colour safely.
     */
    this.getColour = function () {
        return this._colour;
    }
    
    /**
     * @param {p5.Vector} worldCenterPos centre coordinate of world as a p5.Vector
     * @param {Number} worldDiameter diameter of world as a number
     */
    this.constrainToSphere = function (worldCenterPos, worldDiameter) {
        if (this._position.dist(worldCenterPos) > worldDiameter / 2) {
            // find point on world sphere in direction of (this._position - worldCenterPos)
            let positionDirection = p5.Vector.sub(this._position, worldCenterPos).normalize();
            // new magnitude is inside world sphere accounting for this cell's radius 
            let newMagnitude = worldDiameter / 2 - this._diameter;
            this._position = p5.Vector.mult(positionDirection, newMagnitude); // position is magnitude * direction 
            this._velocity = positionDirection.mult(-this._velocity.mag() * 0.5); // opposite direction
        }
    }
}