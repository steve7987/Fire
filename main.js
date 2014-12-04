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

var keyList = new Array(256);

for (var i = 0; i < keyList.length; i++){
	keyList[i] = false;
}

function onClick(event){
	var x = event.clientX;
	var y = event.clientY;
	console.log("Click at: " + x + ", " + y);
	
}

function onMove(event){
	var x = event.clientX;
	var y = event.clientY;
	//console.log("Move at: " + x + ", " + y);
}

function onKeyDown(event){
	switch(event.keyCode){
		case 87:
			if (!keyList[87]) { hero.yvel -= hero.jumpPower; }
			break;
		case 65:
			if (!keyList[65]) { hero.xvel -= hero.speed; }
			break;
		case 83:
			//if (!keyList[83]) { hero.yvel += hero.speed; }
			break;
		case 68:
			if (!keyList[68]) { hero.xvel += hero.speed; }
			break;
	}
	keyList[event.keyCode] = true;
}

function onKeyUp(event){
	keyList[event.keyCode] = false; 
	switch(event.keyCode){
		case 87:
			//hero.yvel -= -hero.speed;
			break;
		case 65:
			hero.xvel -= -hero.speed;
			break;
		case 83:
			//hero.yvel += -hero.speed;
			break;
		case 68:
			hero.xvel += -hero.speed;
			break;
	}
}

function Hero(xpos, ypos, width, height, color){
	this.x = xpos;
	this.y = ypos;
	this.dx = width;
	this.dy = height;
	this.color = color;
	this.xvel = 0;
	this.yvel = 0;
	this.speed = 150;
	this.jumpPower = 250;
}

Hero.prototype.draw = function(){
	ctx.fillStyle = this.color;
	ctx.fillRect(this.x, this.y, this.dx, this.dy);
	ctx.fill();
}

Hero.prototype.update = function(dt){
	var oldX = this.x;
	var oldY = this.y;
	//gravity
	this.yvel += 150 * dt / 1000.0;
	//update position
	this.x += this.xvel * dt / 1000.0;
	this.y += this.yvel * dt / 1000.0;

	for (var i = 0; i < blockList.length; i++){
		if (blockList[i].collide(this)){
			//compute new position and velocities
			this.adjust(blockList[i], oldX, oldY);
		}
	}
}

Hero.prototype.adjust = function(cBlock, oldX, oldY){
	var tRight = (cBlock.x - oldX - this.dx) / this.xvel;
	var tLeft = (cBlock.x + cBlock.dx - oldX) / this.xvel;
	var tUp = (cBlock.y +cBlock.dy - oldY) / this.yvel;
	var tDown = (cBlock.y - oldY - this.dy) / this.yvel;
	if (tRight < 0 || this.xvel == 0) { tRight = Infinity; }
	if (tLeft < 0 || this.xvel == 0) { tLeft = Infinity; }
	if (tUp < 0 || this.yvel == 0) { tUp = Infinity; }
	if (tDown < 0 || this.yvel == 0) { tDown = Infinity; }
	console.log(tRight + ", " + tLeft + ", " + tUp + ", " + tDown);
	if (tRight < tLeft && tRight < tUp && tRight < tDown){
		this.x = cBlock.x - this.dx; //oldX + this.xvel * tRight;
		this.y = oldY + this.yvel * tRight;
		this.xvel = 0;
	}
	else if (tLeft < tUp && tLeft < tDown){
		this.x = cBlock.x + cBlock.dx; //oldX + this.xvel * tLeft;
		this.y = oldY + this.yvel * tLeft;
		this.xvel = 0;
	}
	else if (tUp < tDown){
		this.x = oldX + this.xvel * tUp;
		this.y = cBlock.y + cBlock.dy; //oldY + this.yvel * tUp;
		this.yvel = 0;
	}
	else {
		this.x = oldX + this.xvel * tDown;
		this.y = cBlock.y - this.dy; //oldY + this.yvel * tDown;
		this.yvel = 0;
	}
	if (cBlock.collide(this)){
		console.log("still colliding");
	}
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