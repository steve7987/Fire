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
	keyList[event.keyCode] = true;
	keyPressed[event.keyCode] = true;
}

function onKeyUp(event){
	keyList[event.keyCode] = false; 
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
	this.extraJumps = 4;
	this.jumpsLeft = this.extraJumps;
	this.jumpHorizontalAccel = 300;  //how fast velocity can change while jumping
	
}

Hero.prototype.draw = function(){
	ctx.fillStyle = this.color;
	ctx.fillRect(this.x, this.y, this.dx, this.dy);
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
		if (keyList[65]  && this.xvel > -this.speed) { 
			this.xvel -= this.jumpHorizontalAccel * dt / 1000.0; 
		}
		if (keyList[68] && this.xvel < this.speed) { 
			this.xvel += this.jumpHorizontalAccel * dt / 1000.0; 
		}
	}	
	
	//gravity
	this.yvel += 980 * dt / 1000.0;
	//update position
	this.x += this.xvel * dt / 1000.0;
	this.y += this.yvel * dt / 1000.0;

	for (var i = 0; i < blockList.length; i++){
		if (blockList[i].collide(this)){
			//compute new position and velocities
			this.adjust(blockList[i], oldX, oldY, dt / 1000.0);
		}
	}
}

//adjusts the hero's position, so it is no longer touching any of the blocks
//but it is as close as it can be to where it would have collided
Hero.prototype.adjust = function(cBlock, oldX, oldY, dt){
	var tRight = (cBlock.x - oldX - this.dx) / this.xvel;
	var tLeft = (cBlock.x + cBlock.dx - oldX) / this.xvel;
	var tUp = (cBlock.y +cBlock.dy - oldY) / this.yvel;
	var tDown = (cBlock.y - oldY - this.dy) / this.yvel;


	//check for collision on each side and adjust if there is a collision
	if (tRight < dt && tRight >= 0 && this.xvel != 0){
		this.x = cBlock.x - this.dx;
		this.xvel = 0;
	}
	if (tLeft < dt && tLeft >= 0 && this.xvel != 0){
		this.x = cBlock.x + cBlock.dx;
		this.xvel = 0;
	}
	if (tUp < dt && tUp >= 0 && this.yvel != 0){
		this.y = cBlock.y + cBlock.dy;
		this.yvel = 0;
	}
	if (tDown < dt && tDown >= 0 && this.yvel != 0){
		this.y = cBlock.y - this.dy;
		this.yvel = 0;
	}
	
	if (cBlock.collide(this)){
		console.log("still colliding");
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

var hero = new Hero(30, canvas.height / 2, 8, 20, '#1FFF1F');

function Block(xpos, ypos, width, height, color){
	this.x = xpos;
	this.y = ypos;
	this.dx = width;
	this.dy = height;
	this.color = color;
}

Block.prototype.draw = function(){
	ctx.fillStyle = this.color;
	ctx.fillRect(this.x, this.y, this.dx, this.dy);
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

var blockList = [];
blockList.push(new Block(50, 50, 100, 100, "#FF1F1F"));
blockList.push(new Block(150, 150, 100, 100, "#FF1F1F"));
blockList.push(new Block(0, canvas.height - 10, canvas.width, 10, "#FF1F1F"));


function update(dt){
	hero.update(dt);
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

draw(0);