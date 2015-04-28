
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
								 Math.floor((Math.random() * 3 + 3)) * variables.tileWidth,
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
