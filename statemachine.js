//game state machine
function StateMachine(config){
	this.currentState = config.initial;
	this.callbacks = config.callbacks;
	this.variables = config.variables;
	
	this.callbacks["onEnter" + this.currentState]("nostate", this, this.variables);
}

StateMachine.prototype.change = function(nextState){
	if (this.callbacks["onExit" + this.currentState]){
		this.callbacks["onExit" + this.currentState](nextState, this, this.variables);
	}
	var prevState = this.currentState;
	this.currentState = nextState;
	if (this.callbacks["onEnter" + this.currentState]) {
		this.callbacks["onEnter" + this.currentState](prevState, this, this.variables);
	}
}

StateMachine.prototype.onClick = function(x, y){
	if (this.callbacks["onClick" + this.currentState]){
		this.callbacks["onClick" + this.currentState](x, y, this, this.variables);
	}
}

StateMachine.prototype.onKeyUp = function(event){
	if (this.callbacks["onKeyUp" + this.currentState]){
		this.callbacks["onKeyUp" + this.currentState](event, this, this.variables);
	}
}

StateMachine.prototype.onKeyDown = function(event){
	if (this.callbacks["onKeyDown" + this.currentState]){
		this.callbacks["onKeyDown" + this.currentState](event, this, this.variables);
	}
}

StateMachine.prototype.onMove = function(x, y){
	if (this.callbacks["onMove" + this.currentState]){
		this.callbacks["onMove" + this.currentState](x, y, this, this.variables);
	}
}

