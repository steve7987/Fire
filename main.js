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

//setting up basic variables
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

var hero;
var blockList;
var camera;

//initializes a level
function initGame(){
	hero = new Hero(30, canvas.height / 2, 8, 20, '#1FFF1F');
	camera = new Camera(0, canvas.width, 0, 0, 0, 0);
	blockList = [];
	blockList.push(new Block(0, canvas.height - 10, canvas.width, 10, "#FF1F1F"));
	for (var i = 0; i < 15; i++){
		blockList.push(new Block(Math.floor((Math.random() * canvas.width / 20 + i * canvas.width / 15)), 
								 Math.floor((Math.random() * canvas.height / 2 + canvas.height / 3)),
								 Math.floor((Math.random() * 100 + 10)),
								 Math.floor((Math.random() * 100 + 10)), "#FF1F1F")); 
	}
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

function Camera(minX, maxX, minY, maxY, startX, startY){  //boundaries for the camera
	this.minX = minX;
	this.minY = minY;
	this.maxX = maxX;
	this.maxY = maxY;
	
	this.x = startX;
	this.y = startY;
	
	this.xOffset = canvas.width / 2;
	this.yOffset = canvas.height * 0.75;
	
}

Camera.prototype.Update = function(dt){
	this.x = hero.x + hero.dx / 2 - this.xOffset;
	this.y = hero.y + hero.dy / 2 - this.yOffset;
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
	
}

Hero.prototype.draw = function(){
	ctx.fillStyle = this.color;
	ctx.fillRect(this.x - camera.x, this.y - camera.y, this.dx, this.dy);
	ctx.fill();
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
			if (!onGround){
				this.jumpsLeft--;
				//adjust velocity for secondary jumps
				this.xvel = 0;
				if (keyList[65]) { 
					this.xvel -= this.speed; 
				}
				if (keyList[68]) { 
					this.xvel += this.speed; 
				}
			}
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
	
	
	//update position
	this.x += this.xvel * dt / 1000.0;
	this.y += this.yvel * dt / 1000.0;
	
	//proposed change in time for x and y, if there will be collisions, adjust them 
	this.pdtx = dt / 1000.0;
	this.pdty = dt / 1000.0;
	for (var i = 0; i < blockList.length; i++){
		if (blockList[i].collide(this)){
			//compute new position and velocities
			this.adjust(blockList[i], oldX, oldY);
		}
	}
	if (this.pdtx < dt / 1000.0){
		this.x = oldX + this.xvel * this.pdtx;
		this.xvel = 0;
	}
	if (this.pdty < dt / 1000.0){
		this.y = oldY + this.yvel * this.pdty;
		this.yvel = 0;
	}
}

//adjusts the hero's position, so it is no longer touching any of the blocks
//but it is as close as it can be to where it would have collided
Hero.prototype.adjust = function(cBlock, oldX, oldY){
	var tRight = (cBlock.x - oldX - this.dx) / this.xvel;
	var tLeft = (cBlock.x + cBlock.dx - oldX) / this.xvel;
	var tUp = (cBlock.y +cBlock.dy - oldY) / this.yvel;
	var tDown = (cBlock.y - oldY - this.dy) / this.yvel;


	//check for collision on each side and adjust if there is a collision
	if (tRight < this.pdtx && tRight >= 0 && this.xvel != 0){
		this.pdtx = tRight;
	}
	if (tLeft < this.pdtx && tLeft >= 0 && this.xvel != 0){
		this.pdtx = tLeft;
	}
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

Block.prototype.draw = function(){
	ctx.fillStyle = '#FFFFFF';
	ctx.fillRect(this.x - 1 - camera.x, this.y - 1 - camera.y, this.dx + 2, this.dy + 2);
	ctx.fill();


	ctx.fillStyle = this.color;
	ctx.fillRect(this.x - camera.x, this.y - camera.y, this.dx, this.dy);
	ctx.fill();
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




function update(dt){
	hero.update(dt);
	camera.Update(dt);
}

var draw = function(timestamp){
	window.requestAnimFrame(draw);
	resetCanvas();
	//set black background
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fill();
	//draw items
	for (var i = 0; i < blockList.length; i++){
		blockList[i].draw();
	}
	hero.draw();

	//update items
	update(timestamp - lastFrameTime);
	lastFrameTime = timestamp;
}

window.onload = function(){
	initGame();
	draw(0);
}
