window.requestAnimFrame = 	window.requestAnimationFrame ||
							window.webkitRequestAnimationFrame ||
							window.mozRequestAnimationFrame    ||
							function(callback) { window.setTimeout(callback, 1000 / 60); };

//fancy code from stack overflow
var resetCanvas = function(){
	// Store the current transformation matrix
	ctx.save();

	// Use the identity matrix while clearing the canvas
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Restore the transform
	ctx.restore();
	
	
}

//setting up variables for controlling screen
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

var lastFrameTime = 0;
var mouseX = 0;
var mouseY = 0;

//need to check for clicks in entire window to keep track of mouse button being down
canvas.addEventListener("mousedown", onClick, false);  //add mouse listener which calls onClick function
window.addEventListener("mousemove", onMove, false);
window.addEventListener("keydown", onKeyDown, false);

window.addEventListener("keyup", onKeyUp, false);

//keeps track of which keys are down, and if they have been pressed
var keyList = new Array(256);
var keyPressed = new Array(256);
	for (var i = 0; i < keyList.length; i++){
	keyList[i] = false;
	keyPressed[i] = false;
}

function onClick(event){
	var x = event.clientX;
	var y = event.clientY;
	console.log("Click at: " + x + ", " + y);
}

function onMove(event){
	var x = event.clientX;
	var y = event.clientY;
}

function onKeyDown(event){
	if (!keyList[event.keyCode]) {  //if the key was just pressed now
		keyPressed[event.keyCode] = true;
	}
	keyList[event.keyCode] = true;
}

function onKeyUp(event){
	keyList[event.keyCode] = false; 
}

var hero;
var blockList;
var camera;
var level;

//initializes a level
function initGame(levelLength){
	hero = new Hero(30, canvas.height / 4, 15, 24, '#1FFF1F');
	camera = new Camera(0, 3*canvas.width, -canvas.height, canvas.height, 0, 0);
	blockList = [];
	blockList.push(new Block(0, canvas.height - 10, canvas.width, 10, "#FF1F1F"));
	for (var i = 0; i < levelLength; i++){
		blockList.push(new Block(Math.floor((Math.random() * canvas.width / 20 + i * canvas.width / 15)), 
								 Math.floor((Math.random() * canvas.height / 2 + canvas.height / 3) - 10*i),
								 Math.floor((Math.random() * 100 + 10)),
								 Math.floor((Math.random() * 100 + 10)), "#FF1F1F")); 
	}
	blockList[blockList.length - 1].color = "#1F1FFF";
}

function Camera(minX, maxX, minY, maxY, startX, startY){  //boundaries for the camera
	this.minX = minX;
	this.minY = minY;
	this.maxX = maxX;
	this.maxY = maxY;
	
	this.x = startX;
	this.y = startY;
	
	//spring camera variables
	this.xvel = 0;
	this.yvel = 0;
	this.desiredX = this.x;
	this.desiredY = this.y;
	this.w = 7;  //value to compute constants
	
	//camera offset from center of hero
	this.xOffset = canvas.width / 2;
	this.yOffset = canvas.height / 2;
	
}

Camera.prototype.Update = function(dt){

	this.desiredX = hero.x + hero.dx / 2 - this.xOffset;
	if (hero.onGround() || hero.yvel >= 490){
		this.desiredY = hero.y + hero.dy / 2 - this.yOffset;
	}
	//modify x
	if ((this.x - this.desiredX)*(this.x - this.desiredX) > 0.01){
		var xaccel = -2*this.w*this.xvel + (this.x - this.desiredX) * (-1*this.w*this.w);
		this.xvel += xaccel * dt / 1000.0;
		this.x += this.xvel * dt / 1000.0;
	}
	else {
		this.x = this.desiredX;
		this.xvel = 0;
	}
	//modify y
	if ((this.y - this.desiredY)*(this.y - this.desiredY) > 0.01){
		var yaccel = -2*this.w*this.yvel + (this.y - this.desiredY) * (-1*this.w*this.w);
		this.yvel += yaccel * dt / 1000.0;
		this.y += this.yvel * dt / 1000.0;
	}
	else {
		this.y = this.desiredY;
		this.yvel = 0;
	}
	
	//check camera boundaries
	if (this.x < this.minX) { this.x = this.minX; }
	if (this.x > this.maxX) { this.x = this.maxX; }
	if (this.y < this.minY) { this.y = this.minY; }
	if (this.y > this.maxY) { this.y = this.maxY; }
}

function Hero(xpos, ypos, width, height, color){
	//basic parameters
	this.x = xpos;
	this.y = ypos;
	this.dx = width;
	this.dy = height;
	this.color = color;
	this.xvel = 0;
	this.yvel = 0;
	//ground movement vars
	this.speed = 150;
	//jumping vars
	this.jumpPower = 450;  //velocity given by jumping
	this.extraJumps = 1;
	this.jumpsLeft = this.extraJumps;
	this.jumpHorizontalAccel = 800;  //how fast velocity can change while jumping
	
	//animation variables
	this.facing = 1; //1 is right, -1 if left
	
	this.animationType = -1;  //-1 is default (0,0) pose, other values refer to level in the sprite sheet
	this.Frame = 0;
	this.Timer = 0;
	this.maxFrames = [4, 2, 1, 3];  //the max frames for each type of animation
	this.milliPerFrame = [100, 350, 100, 75];  //milliseconds for each frame
	this.repeat = [true, false, false, false];  //if the animation should loop or just stop on last frame
	
}

Hero.prototype.draw = function(dt){
	if (this.animationType >= 0){
		//update the animation frame if needed
		this.Timer += dt;
		if (this.Timer > this.milliPerFrame[this.animationType]){
			this.Timer -= this.milliPerFrame[this.animationType];
			this.Frame++;
			if (this.Frame >= this.maxFrames[this.animationType]){
				//if animation repeats, reset to zero otherwise stay on last frame
				if (this.repeat[this.animationType]){
					this.Frame = 0;
				}
				else {
					this.Frame--;
				}
			}
		}
		//draw the sprite.  flip it if facing left
		if (this.facing == 1){
			ctx.save();
			ctx.translate(this.x - camera.x, this.y - camera.y);
			ctx.drawImage(heroImg, this.Frame * 16, this.animationType * 25, 15, 24, 0, 0, 15, 24);
			ctx.restore();
		}
		else {
			ctx.save();
			ctx.translate(this.x - camera.x + this.dx, this.y - camera.y);
			ctx.scale(-1, 1);
			ctx.drawImage(heroImg, this.Frame * 16, this.animationType * 25, 15, 24, 0, 0, 15, 24);
			ctx.restore();
		}
	}
	else {
		//draw default standing animation
		if (this.facing == 1){
			ctx.save();
			ctx.translate(this.x - camera.x, this.y - camera.y);
			ctx.drawImage(heroImg, 0, 0, 15, 24, 0, 0, 15, 24);
			ctx.restore();
		}
		else {
			ctx.save();
			ctx.translate(this.x - camera.x + this.dx, this.y - camera.y);
			ctx.scale(-1, 1);
			ctx.drawImage(heroImg, 0, 0, 15, 24, 0, 0, 15, 24);
			ctx.restore();
		}
	}
}

Hero.prototype.changeAnimation = function(newAnim){
	if (newAnim == this.animationType){
		return;
	}
	this.Frame = 0;
	this.Timer = 0;
	this.animationType = newAnim;
}

Hero.prototype.update = function(dt){
	var oldX = this.x;
	var oldY = this.y;
	//deal with jumping
	var onGround = this.onGround();
	if (onGround){
		this.jumpsLeft = this.extraJumps;
	}
	
	if (keyPressed[87]) {
		keyPressed[87] = false;
		if ((this.jumpsLeft > 0 || onGround)){
			this.yvel = -1 * this.jumpPower;
			if (this.xvel != 0){			
				this.changeAnimation(1);  //jump from ground when moving
			}
			else {
				this.changeAnimation(3);  //straight up jump (for now same as air jump)
			}
			if (!onGround){
				this.jumpsLeft--;
				this.changeAnimation(3);  //air jump animation
				//adjust velocity for secondary jumps
				this.xvel = 0;
				if (keyList[65]) { 
					this.xvel -= this.speed; 
				}
				if (keyList[68]) { 
					this.xvel += this.speed; 
				}
			}
			onGround = false;
		}
	}
	//compute velocities based on keys down
	if (onGround){
		this.xvel = 0;
		if (keyList[65]) { 
			this.xvel -= this.speed; 
		}
		if (keyList[68]) { 
			this.xvel += this.speed; 
		}
	}
	else {
		//movement in the air
		if (keyList[65]  && this.xvel > -this.speed) { 
			this.xvel -= this.jumpHorizontalAccel * dt / 1000.0; 
		}
		if (keyList[68] && this.xvel < this.speed) { 
			this.xvel += this.jumpHorizontalAccel * dt / 1000.0; 
		}
		if (!keyList[65] && !keyList[68]){
			this.xvel *= 0.9;
		}
		//gravity
		this.yvel += 980 * dt / 1000.0;
		if (this.yvel > 980){
			this.yvel = 980;
		}
	}	
	//determine animation type
	if (this.xvel > 0){
		this.facing = 1;
	}
	else if (this.xvel < 0){
		this.facing = -1;
	}
	if (onGround && this.xvel != 0){
		this.changeAnimation(0);  //walking animation
	}
	else if (!onGround && this.yvel > 0){
		this.changeAnimation(2);  //falling animation
	}
	else if (onGround && this.xvel == 0) {
		this.animationType = -1;  //default standing animation
	}
	
	//update position
	this.x += this.xvel * dt / 1000.0;
	this.y += this.yvel * dt / 1000.0;
	
	//proposed change in time for x and y, if there will be collisions, adjust them 
	this.pdtx = dt / 1000.0;
	this.pdty = dt / 1000.0;
	//adjust y pos first, then do x
	for (var i = 0; i < blockList.length; i++){
		if (blockList[i].collide(this)){
			//compute new position and velocities
			this.adjustY(blockList[i], oldX, oldY);
		}
	}
	if (this.pdty < dt / 1000.0){
		this.y = oldY + this.yvel * this.pdty;
		this.yvel = 0;
	}
	for (var i = 0; i < blockList.length; i++){
		if (blockList[i].collide(this)){
			//compute new position and velocities
			this.adjustX(blockList[i], oldX, oldY);
		}
	}
	if (this.pdtx < dt / 1000.0){
		this.x = oldX + this.xvel * this.pdtx;
		this.xvel = 0;
	}
	
}

//adjusts the hero's position, so it is no longer touching any of the blocks
//but it is as close as it can be to where it would have collided
Hero.prototype.adjustX = function(cBlock, oldX, oldY){
	var tRight = (cBlock.x - oldX - this.dx) / this.xvel;
	var tLeft = (cBlock.x + cBlock.dx - oldX) / this.xvel;


	//check for collision on each side and adjust if there is a collision
	if (tRight < this.pdtx && tRight >= 0 && this.xvel != 0){
		this.pdtx = tRight;
	}
	if (tLeft < this.pdtx && tLeft >= 0 && this.xvel != 0){
		this.pdtx = tLeft;
	}
}

Hero.prototype.adjustY = function(cBlock, oldX, oldY){
	var tUp = (cBlock.y +cBlock.dy - oldY) / this.yvel;
	var tDown = (cBlock.y - oldY - this.dy) / this.yvel;


	//check for collision on each side and adjust if there is a collision
	if (tUp < this.pdty && tUp >= 0 && this.yvel != 0){
		this.pdty = tUp;
	}
	if (tDown < this.pdty && tDown >= 0 && this.yvel != 0){
		this.pdty = tDown;
	}
}

//checks if the hero is on top of a block
Hero.prototype.onGround = function(){
	for (var i = 0; i < blockList.length; i++){
		if (blockList[i].touchingBelow(this)){
			return true;
		}
	}
	return false;
}



function Block(xpos, ypos, width, height, color){
	this.x = xpos;
	this.y = ypos;
	this.dx = width;
	this.dy = height;
	this.color = color;
}

Block.prototype.draw = function(dt){
	//ctx.fillStyle = '#FFFFFF';
	//ctx.fillRect(Math.round(this.x - 1 - camera.x), Math.round(this.y - 1 - camera.y), this.dx + 2, this.dy + 2);

	ctx.fillStyle = this.color;
	ctx.fillRect(this.x - camera.x, this.y - camera.y, this.dx, this.dy);
}

Block.prototype.collide = function(target){
	return !(this.x >= target.x + target.dx || 
           this.x + this.dx <= target.x || 
           this.y >= target.y + target.dy ||
           this.y + this.dy <= target.y);
}

//returns true if the target is directly above this block
Block.prototype.touchingBelow = function(target){
	return !(this.x >= target.x + target.dx || 
           this.x + this.dx <= target.x || 
           this.y > target.y + target.dy ||
           this.y + this.dy <= target.y);
}


function nextLevel(){
	level++;
	initGame(5*level);
	lastFrameTime = 0;
	window.requestAnimFrame(loop);
}

function resetLevel(){
	//reset hero and camera position, but leave blocks the same
	hero = new Hero(30, canvas.height / 4, 15, 24, '#1FFF1F');
	camera = new Camera(0, 3*canvas.width, -canvas.height, canvas.height, 0, 0);
	lastFrameTime = 0;
	window.requestAnimFrame(loop);
}

function update(dt){
	hero.update(dt);
	camera.Update(dt);
}

function drawScreen(timestamp){
	//draw items
	resetCanvas();
	//set background
	ctx.fillStyle = "#F1F1F1";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	//draw items
	for (var i = 0; i < blockList.length; i++){
		blockList[i].draw(timestamp);
	}
	hero.draw(timestamp);
	ctx.fillStyle = "#000000";
	ctx.fillText("Level: " + level, 50, 25);
}

var loop = function(timestamp){
	
	//update items
	var timeStep = 0;
	if (lastFrameTime != 0){
		timeStep = timestamp - lastFrameTime;
		update(timeStep);
	}
	lastFrameTime = timestamp;

	
	drawScreen(timeStep);
	
	
	//check for end of level
	if (blockList[blockList.length - 1].touchingBelow(hero)){
		hero.changeAnimation(-1);
		drawScreen(0);
		ctx.fillStyle = "#000000";
		ctx.fillText("Level Complete", 50, 50);
		//start next level in 1000 milliseconds and don't call loop anymore
		window.setTimeout(nextLevel, 1000);
		return;
	}
	//check for hero death
	if (hero.y > camera.maxY + canvas.height){  //death from falling
		ctx.fillStyle = "#000000";
		ctx.fillText("You Died", 50, 50);
		window.setTimeout(resetLevel, 1000);
		return;
	}
	//request next frame to be drawn
	window.requestAnimFrame(loop);
}

var heroImg = new Image();
heroImg.src = "./char.png";

window.onload = function(){
	level = 1;
	initGame(5*level);
	window.requestAnimFrame(loop);
}
