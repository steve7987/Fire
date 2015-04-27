//main functions
function onEnterMain(from, fsm, variables){
	resetCanvas(variables);
	variables.ctx.fillStyle = "#0f0f0f";
	variables.ctx.textAlign = "center";
	variables.ctx.fillText("Main game", variables.canvas.width / 2, variables.canvas.height * 3 / 4);
	
	variables.lastFrameTime = 0;
	variables.mouseX = 0;
	variables.mouseY = 0;

	//keeps track of which keys are down, and if they have been pressed
	variables.keyList = new Array(256);
	variables.keyPressed = new Array(256);
		for (var i = 0; i < variables.keyList.length; i++){
		variables.keyList[i] = false;
		variables.keyPressed[i] = false;
	}
	var loop = function(timestamp){
		
		//update items
		var timeStep = 0;
		if (variables.lastFrameTime != 0){
			timeStep = timestamp - variables.lastFrameTime;
			update(timeStep, variables);
		}
		variables.lastFrameTime = timestamp;

		
		drawScreen(timeStep, variables);
		
		
		//check for end of level
		if (variables.blockList[variables.blockList.length - 1].touchingBelow(variables.hero)){
			fsm.change("Level");
			return;
		}
		//check for hero death
		if (variables.hero.y > variables.camera.maxY + variables.canvas.height){  //death from falling
			console.log("death");
			fsm.change("Death");
			return;
		}
		//request next frame to be drawn
		window.requestAnimFrame(loop);
	}	
	window.requestAnimFrame(loop);
}

function onClickMain(x, y, fsm, variables){

}

function onKeyUpMain(event, fsm, variables){
	variables.keyList[event.keyCode] = false; 
}

function onKeyDownMain(event, fsm, variables){
	if (!variables.keyList[event.keyCode]) {  //if the key was just pressed now
		variables.keyPressed[event.keyCode] = true;
	}
	variables.keyList[event.keyCode] = true;
}

//initializes a level
function initGame(levelLength, variables){
	variables.tileWidth = 20;
	variables.tileHeight = 15;
	variables.hero = new Hero(30, variables.canvas.height / 4, 15, 24, '#1FFF1F', variables);
	variables.blockList = [];
	variables.blockList.push(new Block(0, variables.canvas.height - 10, variables.canvas.width, 10, "#FF1F1F", variables));  //ground block
	//create blocks
	for (var i = 0; i < levelLength; i++){
		variables.blockList.push(new Block(Math.floor((Math.random() * variables.canvas.width / 20 + i * variables.canvas.width / 15)), 
								 Math.floor(Math.random() * variables.canvas.height / (2 * variables.tileHeight)) * variables.tileHeight 
											+ variables.canvas.height / 3 - variables.tileHeight*i,
								 Math.floor((Math.random() * 3 + 2)) * variables.tileWidth,
								 variables.tileHeight, 
								 "#FF1F1F", variables)); 
	}
	variables.blockList[variables.blockList.length - 1].color = "#1F1FFF";
	variables.camera = new Camera(0, levelLength / 15 * variables.canvas.width, -variables.canvas.height - levelLength * variables.tileHeight, 
								  variables.canvas.height, 0, 0, variables);
}

function resetLevel(variables){
	//reset hero and camera position, but leave blocks the same
	variables.hero = new Hero(30, variables.canvas.height / 4, 15, 24, '#1FFF1F', variables);
	variables.camera.x = 0;
	variables.camera.y = 0;
	variables.camera.xvel = 0;
	variables.camera.ypos = 0;
	variables.camera.desiredX = 0;
	variables.camera.desiredY = 0;
}


function update(dt, variables){
	variables.hero.update(dt);
	variables.camera.Update(dt);
}

function drawScreen(timestamp, variables){
	//draw items
	resetCanvas(variables);
	//set background
	variables.ctx.fillStyle = "#F1F1F1";
	variables.ctx.fillRect(0, 0, variables.canvas.width, variables.canvas.height);
	//draw items
	for (var i = 0; i < variables.blockList.length; i++){
		variables.blockList[i].draw(timestamp);
	}
	variables.hero.draw(timestamp);
	variables.ctx.fillStyle = "#000000";
	variables.ctx.fillText("Level: " + variables.level, 50, 25);
}