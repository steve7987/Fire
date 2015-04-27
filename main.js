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
	blockList = [];
	blockList.push(new Block(0, canvas.height - 10, canvas.width, 10, "#FF1F1F"));  //ground block
	//create blocks
	var tileWidth = 20;
	var tileHeight = 15;
	for (var i = 0; i < levelLength; i++){
		blockList.push(new Block(Math.floor((Math.random() * canvas.width / 20 + i * canvas.width / 15)), 
								 Math.floor(Math.random() * canvas.height / (2 * tileHeight)) * tileHeight + canvas.height / 3 - tileHeight*i,
								 Math.floor((Math.random() * 3 + 2)) * tileWidth,
								 tileHeight, 
								 "#FF1F1F")); 
	}
	blockList[blockList.length - 1].color = "#1F1FFF";
	camera = new Camera(0, levelLength / 15 * canvas.width, -canvas.height - levelLength * tileHeight, canvas.height, 0, 0);
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
	//camera = new Camera(0, 3*canvas.width, -canvas.height, canvas.height, 0, 0);
	camera.x = 0;
	camera.y = 0;
	camera.xvel = 0;
	camera.ypos = 0;
	camera.desiredX = 0;
	camera.desiredY = 0;
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
