var labelName;

var yPosTemp;
var direction;

//Making a new class that extends the Phaser Sprite class. This allows us to easily make as many enemies as we want.
var Enemy = new Phaser.Class({
	Extends: Phaser.GameObjects.Sprite,

	initialize:
		function Enemy(game, xPos, yPos, name, direction) {
			Phaser.GameObjects.Sprite.call(this, game, xPos, yPos, 'enemy');

			//Enemy label.
			this.labelName = game.add.text(80, 40, name);

			//Temporary y value for the "ai" to keep jumping.
			yPosTemp = (yPos + 50);
			this.direction = direction;
			
			game.physics.add.existing(this, false);
		}
	
});

//Giving us the ability to make the new thing a Sprite Object, for Phaser to recognize.
Enemy.prototype = Object.create(Phaser.GameObjects.Sprite.prototype);
Enemy.prototype.constructor = Enemy;

//Enemy's create function, called from the create function of the main game loop.
Enemy.prototype.create = function (game) {
	this.labelName.setAlign('left');
	this.labelName.setFill('#333333');
};

//Same as create loop, but this gets called every frame.
Enemy.prototype.update = function (game) {

	this.labelName.setPosition(this.x - 35, this.y - 60);
	
	//If the enemy is below (or if the y is higher than) the temporary value, the game makes it jump.
	if (this.y >= yPosTemp) {
		this.body.setVelocityY(-200);

		//If the direction is true, the enemy will move to the left.
		if (this.direction) {
			this.body.setVelocityX(-200);
		} else {
			this.body.setVelocityX(200);
		}

		//Allows us to call functions based on how much time has passed, sets the yPosTemp to different
		//heights, to appear the enemy to move up and down.
		var upEnemy = game.time.delayedCall(5000, function () {
			yPosTemp = 200;
			var downEnemy = game.time.delayedCall(1500, function () { yPosTemp = 500; }, [], this);
		}, [], this); //copied from https://labs.phaser.io/edit.html?src=src\time\timer%20event.js
		
	}
};