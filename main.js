//main functions
function onEnterMain(from, fsm, variables){
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