//fancy code from stack overflow
var resetCanvas = function(variables){
	// Store the current transformation matrix
	variables.ctx.save();

	// Use the identity matrix while clearing the canvas
	variables.ctx.setTransform(1, 0, 0, 1, 0, 0);
	variables.ctx.clearRect(0, 0, variables.canvas.width, variables.canvas.height);

	// Restore the transform
	variables.ctx.restore();
}

//loading function
function onEnterLoading(from, fsm, variables){
	resetCanvas(variables);
	variables.canvas.width = 800;
	variables.canvas.height = 600;
	variables.ctx.fillStyle = "#0f0f0f";
	variables.ctx.textAlign = "center";
	variables.ctx.fillText("Loading", variables.canvas.width / 2, variables.canvas.height * 3 / 4);
	variables.heroImg = new Image();
	variables.heroImg.src = "./char.png";
}

//menu functions
function onEnterMenu(from, fsm, variables){
	resetCanvas(variables);
	variables.ctx.fillStyle = "#0f0f0f";
	variables.ctx.textAlign = "center";
	variables.ctx.fillText("Click to Start", variables.canvas.width / 2, variables.canvas.height * 3 / 4);
}

function onExitMenu(from, fsm, variables){
	variables.level = 1;
	initGame(5*variables.level, variables);
}

function onClickMenu(x, y, fsm, variables){
	fsm.change("Main");
}

function onKeyDownMenu(event, fsm, variables){
	if (event.keyCode == 32){  //space pressed
		fsm.change("Main");
	}
}

//level functions
function onEnterLevel(from, fsm, variables){
	variables.ctx.fillStyle = "#0f0f0f";
	variables.ctx.textAlign = "center";
	variables.ctx.fillText("Level Complete!!!", variables.canvas.width / 2, variables.canvas.height * 3 / 4);
	variables.ctx.fillText("Click to Continue", variables.canvas.width / 2, variables.canvas.height * 3 / 4 + 20);
}

function onExitLevel(from, fsm, variables){
	variables.level++;
	initGame(5*variables.level, variables);
}

function onClickLevel(x, y, fsm, variables){
	fsm.change("Main");
}

function onKeyDownLevel(event, fsm, variables){
	if (event.keyCode == 32){  //space pressed
		fsm.change("Main");
	}
}

//death functions
function onEnterDeath(from, fsm, variables){
	variables.ctx.fillStyle = "#0f0f0f";
	variables.ctx.textAlign = "center";
	variables.ctx.fillText("You Died...", variables.canvas.width / 2, variables.canvas.height * 3 / 4);
	variables.ctx.fillText("Click to Continue", variables.canvas.width / 2, variables.canvas.height * 3 / 4 + 20);
}

function onExitDeath(from, fsm, variables){
	resetLevel(variables);
}

function onClickDeath(x, y, fsm, variables){
	fsm.change("Main");
}

function onKeyDownDeath(event, fsm, variables){
	if (event.keyCode == 32){  //space pressed
		fsm.change("Main");
	}
}

function Start() {
	//setup state machine
	var config = {
		initial: 'Loading',
		callbacks: {
			onEnterLoading: function(from, fsm, variables) {onEnterLoading(from, fsm, variables)},
			
			onEnterMenu: function(from, fsm, variables) {onEnterMenu(from, fsm, variables)},
			onExitMenu: function(from, fsm, variables) {onExitMenu(from, fsm, variables)},
			onClickMenu: function(x, y, fsm, variables) {onClickMenu(x, y, fsm, variables); },
			onKeyDownMenu: function(event, fsm, variables) { onKeyDownMenu(event, fsm, variables) },
			
			onEnterLevel: function(from, fsm, variables) {onEnterLevel(from, fsm, variables)},
			onExitLevel: function(from, fsm, variables) {onExitLevel(from, fsm, variables)},
			onClickLevel: function(x, y, fsm, variables) {onClickLevel(x, y, fsm, variables); },
			onKeyDownLevel: function(event, fsm, variables) { onKeyDownLevel(event, fsm, variables) },
			
			onEnterDeath: function(from, fsm, variables) {onEnterDeath(from, fsm, variables)},
			onExitDeath: function(from, fsm, variables) {onExitDeath(from, fsm, variables)},
			onClickDeath: function(x, y, fsm, variables) {onClickDeath(x, y, fsm, variables); },
			onKeyDownDeath: function(event, fsm, variables) { onKeyDownDeath(event, fsm, variables) },
			
			onEnterMain: function(from, fsm, variables) { onEnterMain(from, fsm, variables) },
			onClickMain: function(x, y, fsm, variables) { onClickMain(x, y, fsm, variables) },
			onKeyUpMain: function(event, fsm, variables) { onKeyUpMain(event, fsm, variables) },
			onKeyDownMain: function(event, fsm, variables) { onKeyDownMain(event, fsm, variables) }
		},
		variables: {
			canvas: document.getElementById("myCanvas"),
			ctx: document.getElementById("myCanvas").getContext("2d")
			
		}
	}
	var fsm = new StateMachine(config);
	
	//register event functions
	function onClick(event){
		fsm.onClick(event.clientX, event.clientY);
	}
	
	function onKeyDown(event){
		fsm.onKeyDown(event);
	}
	
	function onKeyUp(event){
		fsm.onKeyUp(event);
	}

	function onMove(event){
		fsm.onMove(event.clientX, event.clientY);
	}
	
	document.getElementById("myCanvas").addEventListener("mousedown", onClick, false);
	window.addEventListener("keydown", onKeyDown, false);
	window.addEventListener("keyup", onKeyUp, false);
	window.addEventListener("mousemove", onMove, false);
	//setup animation frames
	window.requestAnimFrame = 	window.requestAnimationFrame ||
							window.webkitRequestAnimationFrame ||
							window.mozRequestAnimationFrame    ||
							function(callback) { window.setTimeout(callback, 1000 / 60); };
	window.onload = function(){
		fsm.change("Menu");
	}
}